from __future__ import annotations

import importlib
from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.crud.fraud_alert import FraudAlertRepository
from app.crud.prediction import PredictionRepository
from app.crud.transaction import TransactionRepository
from app.models import FraudAlert, Prediction, Transaction
from app.models.enums import AlertSeverity, AlertStatus, TransactionStatus
from app.services.ml_model_service import MLModelService
from app.services.transaction_service import TransactionService


class FraudDetectionService:
    def __init__(self, transaction_repo: Optional[TransactionRepository] = None, prediction_repo: Optional[PredictionRepository] = None, fraud_alert_repo: Optional[FraudAlertRepository] = None, ml_model_service: Optional[MLModelService] = None, transaction_service: Optional[TransactionService] = None) -> None:
        self.transaction_repo = transaction_repo or TransactionRepository()
        self.prediction_repo = prediction_repo or PredictionRepository()
        self.fraud_alert_repo = fraud_alert_repo or FraudAlertRepository()
        self.ml_model_service = ml_model_service or MLModelService()
        self.transaction_service = transaction_service or TransactionService()

    def _prepare_features(self, transaction: Transaction) -> dict:
        return {
            "transaction_reference": transaction.transaction_reference,
            "amount": float(transaction.amount),
            "currency": transaction.currency,
            "merchant": transaction.merchant or "",
            "merchant_category": transaction.merchant_category or "",
            "transaction_type": transaction.transaction_type or "",
            "status": transaction.status.value,
        }

    def _infer_probability(self, model_obj, features: dict) -> float:
        if hasattr(model_obj, "predict_proba"):
            return float(model_obj.predict_proba([features])[0][1])
        if hasattr(model_obj, "predict"):
            return float(model_obj.predict([features])[0])
        raise ValueError("Loaded model does not expose a supported inference interface")

    def _get_threshold(self, model_meta) -> float:
        threshold = getattr(model_meta, "threshold", None)
        if threshold is None:
            threshold = getattr(self.ml_model_service.settings, "FRAUD_THRESHOLD", None)
        if threshold is None:
            raise ValueError("No fraud threshold configured for inference")
        return float(threshold)

    def evaluate_transaction(self, db: Session, transaction_id: UUID) -> tuple[Transaction, Prediction, Optional[FraudAlert]]:
        if db.in_transaction():
            db.commit()

        with db.begin():
            transaction = self.transaction_service.get_transaction(db, transaction_id)
            existing_prediction = self.prediction_repo.get_by_transaction(db, transaction.id)
            if existing_prediction is not None:
                raise ValueError(f"Prediction already exists for transaction {transaction_id}")

            model_meta, model_obj = self.ml_model_service.get_model_for_inference(db)
            features = self._prepare_features(transaction)
            fraud_probability = self._infer_probability(model_obj, features)
            threshold = self._get_threshold(model_meta)

            decision = fraud_probability >= float(threshold)
            prediction_payload = {
                "transaction_id": transaction.id,
                "fraud_probability": fraud_probability,
                "predicted_label": "fraud" if decision else "legit",
                "model_version": model_meta.version,
                "threshold_used": threshold,
            }
            prediction = self.prediction_repo.create(db, prediction_payload, commit=False)

            alert = None
            if decision:
                alert_payload = {
                    "transaction_id": transaction.id,
                    "prediction_id": prediction.id,
                    "severity": self._classify_severity(fraud_probability),
                    "status": AlertStatus.OPEN,
                    "assigned_to": None,
                    "reviewed_at": None,
                    "resolution_notes": None,
                }
                alert = self.fraud_alert_repo.create(db, alert_payload, commit=False)
                self.transaction_service.update_transaction_status(db, transaction.id, TransactionStatus.REQUIRES_REVIEW, commit=False)

            return transaction, prediction, alert

    def explain_transaction(self, db: Session, transaction_id: UUID) -> dict:
        transaction = self.transaction_service.get_transaction(db, transaction_id)
        model_meta, model_obj = self.ml_model_service.get_model_for_inference(db)
        if not hasattr(model_obj, "explain"):
            raise ValueError("Loaded model does not support model-rule explanations")

        explanation = model_obj.explain(self._prepare_features(transaction))
        threshold = self._get_threshold(model_meta)
        probability = float(explanation["fraud_probability"])
        return {
            "transaction_id": transaction.id,
            "model_version": model_meta.version,
            "threshold": threshold,
            "raw_score": float(explanation["raw_score"]),
            "fraud_probability": probability,
            "decision": "fraud" if probability >= threshold else "legit",
            "contributions": explanation["contributions"],
        }

    def _classify_severity(self, fraud_probability: float) -> AlertSeverity:
        if fraud_probability >= 0.9:
            return AlertSeverity.CRITICAL
        if fraud_probability >= 0.75:
            return AlertSeverity.HIGH
        if fraud_probability >= 0.5:
            return AlertSeverity.MEDIUM
        return AlertSeverity.LOW
