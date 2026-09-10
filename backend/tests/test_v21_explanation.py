from decimal import Decimal
from types import SimpleNamespace
from uuid import uuid4

from fastapi.testclient import TestClient

from app.api import auth as auth_module
from app.api.routers import transactions as transactions_router
from app.main import app
from app.models.enums import UserRole
from scripts.demo_fraud_model import DemoFraudModel


def test_demo_model_explanation_matches_prediction():
    model = DemoFraudModel()
    features = {
        "transaction_reference": "test",
        "amount": 125.0,
        "currency": "USD",
        "merchant": "Test Merchant",
        "merchant_category": "Retail",
        "transaction_type": "purchase",
        "status": "pending",
    }

    explanation = model.explain(features)

    assert explanation["raw_score"] == 0.15
    assert explanation["fraud_probability"] == 0.5374298453437496
    assert sum(item["contribution"] for item in explanation["contributions"]) == explanation["raw_score"]
    assert model.predict_proba([features])[0][1] == explanation["fraud_probability"]


def test_explanation_endpoint_returns_model_contract(monkeypatch):
    transaction_id = uuid4()
    expected = {
        "transaction_id": transaction_id,
        "model_version": "fraudlens-xgb-v2.2.2",
        "contract_version": "fraudlens-v2.2.1",
        "threshold": 0.883991003036499,
        "fraud_probability": 0.4,
        "decision": "legit",
        "base_value": 0.01,
        "output_space": "raw XGBoost margin (log-odds)",
        "contributions": [{
            "feature_name": "C1",
            "feature_value": 1.0,
            "shap_value": -0.2,
            "direction": "legitimate",
        }],
    }

    class ServiceStub:
        def explain_transaction(self, db, requested_id):
            assert requested_id == transaction_id
            return expected

    monkeypatch.setattr(transactions_router, "FraudDetectionService", ServiceStub)
    monkeypatch.setattr(auth_module, "UserService", lambda: SimpleNamespace(
        get_user_by_email=lambda db, email: SimpleNamespace(
            id=uuid4(), email=email, role=UserRole.ADMIN, status="active"
        ),
        validate_account=lambda db, user: user,
    ))

    token = auth_module.create_access_token("admin@example.com", UserRole.ADMIN)
    with TestClient(app) as client:
        response = client.get(
            f"/api/transactions/{transaction_id}/explanation",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 200
    assert response.json() == {
        **expected,
        "transaction_id": str(transaction_id),
    }
