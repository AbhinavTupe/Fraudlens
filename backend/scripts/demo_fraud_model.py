from __future__ import annotations

import math
from typing import Any


class DemoFraudModel:
    """A lightweight development-only fraud model compatible with the service contract."""

    def __init__(self) -> None:
        self.feature_names = [
            "transaction_reference",
            "amount",
            "currency",
            "merchant",
            "merchant_category",
            "transaction_type",
            "status",
        ]
        self.model_type = "development-demo-logistic-heuristic"

    def _score_details(self, features: dict[str, Any]) -> tuple[float, list[dict[str, Any]]]:
        amount = float(features.get("amount", 0.0))
        merchant = str(features.get("merchant") or "").lower()
        category = str(features.get("merchant_category") or "").lower()
        status = str(features.get("status") or "").lower()

        score = 0.0
        contributions: list[dict[str, Any]] = []
        if amount >= 1500:
            score += 0.55
            contributions.append({"feature": "amount", "value": amount, "contribution": 0.55, "reason": "Transaction amount is at least 1500"})
        elif amount >= 700:
            score += 0.30
            contributions.append({"feature": "amount", "value": amount, "contribution": 0.30, "reason": "Transaction amount is at least 700"})
        elif amount <= 35:
            score -= 0.10
            contributions.append({"feature": "amount", "value": amount, "contribution": -0.10, "reason": "Transaction amount is 35 or less"})

        if "online" in merchant or "ecommerce" in merchant:
            score += 0.20
            contributions.append({"feature": "merchant", "value": features.get("merchant") or "", "contribution": 0.20, "reason": "Merchant indicates online or ecommerce activity"})
        if category in {"gaming", "travel", "digital_services"}:
            score += 0.20
            contributions.append({"feature": "merchant_category", "value": features.get("merchant_category") or "", "contribution": 0.20, "reason": "Merchant category is associated with elevated risk"})
        if status in {"pending", "requires_review"}:
            score += 0.15
            contributions.append({"feature": "status", "value": features.get("status") or "", "contribution": 0.15, "reason": "Transaction is pending or requires review"})
        if merchant in {"cash_advance", "wire_transfer"} or category in {"cash_advance", "money_transfer"}:
            score += 0.30
            contributions.append({"feature": "merchant_or_category", "value": features.get("merchant") or features.get("merchant_category") or "", "contribution": 0.30, "reason": "Merchant or category is a cash advance or money transfer"})

        return score, contributions

    def _score(self, features: dict[str, Any]) -> float:
        score, _ = self._score_details(features)

        return max(0.0, min(1.0, 1.0 / (1.0 + math.exp(-score))))

    def explain(self, features: dict[str, Any]) -> dict[str, Any]:
        raw_score, contributions = self._score_details(features)
        probability = max(0.0, min(1.0, 1.0 / (1.0 + math.exp(-raw_score))))
        return {
            "raw_score": raw_score,
            "fraud_probability": probability,
            "contributions": contributions,
        }

    def predict_proba(self, X: list[dict[str, Any]]) -> list[list[float]]:
        return [[1.0 - self._score(row), self._score(row)] for row in X]

    def predict(self, X: list[dict[str, Any]]) -> list[int]:
        return [1 if self._score(row) >= 0.5 else 0 for row in X]
