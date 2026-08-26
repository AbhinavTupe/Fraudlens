from __future__ import annotations

from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.crud.fraud_alert import FraudAlertRepository
from app.models import FraudAlert
from app.models.enums import AlertSeverity, AlertStatus


class FraudAlertNotFoundError(Exception):
    pass


class FraudAlertService:
    def __init__(self, fraud_alert_repo: Optional[FraudAlertRepository] = None) -> None:
        self.fraud_alert_repo = fraud_alert_repo or FraudAlertRepository()

    def get_alert(self, db: Session, alert_id: UUID) -> FraudAlert:
        alert = self.fraud_alert_repo.get_by_id(db, alert_id)
        if alert is None:
            raise FraudAlertNotFoundError(f"Fraud alert {alert_id} was not found")
        return alert

    def create_alert(self, db: Session, *, transaction_id: UUID, prediction_id: UUID, severity: AlertSeverity, status: AlertStatus = AlertStatus.OPEN) -> FraudAlert:
        payload = {
            "transaction_id": transaction_id,
            "prediction_id": prediction_id,
            "severity": severity,
            "status": status,
            "assigned_to": None,
            "reviewed_at": None,
            "resolution_notes": None,
        }
        return self.fraud_alert_repo.create(db, payload)

    def update_status(self, db: Session, alert_id: UUID, status: AlertStatus) -> FraudAlert:
        alert = self.get_alert(db, alert_id)
        return self.fraud_alert_repo.update(db, alert, {"status": status})

    def assign_alert(self, db: Session, alert_id: UUID, assigned_to: UUID) -> FraudAlert:
        alert = self.get_alert(db, alert_id)
        return self.fraud_alert_repo.update(db, alert, {"assigned_to": assigned_to})
