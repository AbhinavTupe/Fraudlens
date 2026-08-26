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

    def _score(self, features: dict[str, Any]) -> float:
        amount = float(features.get("amount", 0.0))
        merchant = str(features.get("merchant") or "").lower()
        category = str(features.get("merchant_category") or "").lower()
        status = str(features.get("status") or "").lower()

        score = 0.0
        if amount >= 1500:
            score += 0.55
        elif amount >= 700:
            score += 0.30
        elif amount <= 35:
            score -= 0.10

        if "online" in merchant or "ecommerce" in merchant:
            score += 0.20
        if category in {"gaming", "travel", "digital_services"}:
            score += 0.20
        if status in {"pending", "requires_review"}:
            score += 0.15
        if merchant in {"cash_advance", "wire_transfer"} or category in {"cash_advance", "money_transfer"}:
            score += 0.30

        return max(0.0, min(1.0, 1.0 / (1.0 + math.exp(-score))))

    def predict_proba(self, X: list[dict[str, Any]]) -> list[list[float]]:
        return [[1.0 - self._score(row), self._score(row)] for row in X]

    def predict(self, X: list[dict[str, Any]]) -> list[int]:
        return [1 if self._score(row) >= 0.5 else 0 for row in X]
