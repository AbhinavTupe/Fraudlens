from decimal import Decimal
from types import SimpleNamespace
from uuid import uuid4

from fastapi.testclient import TestClient

from app.api import auth as auth_module
from app.api.routers import transactions as transactions_router
from app.main import app
from app.models.enums import UserRole
from app.services.fraud_detection_service import FraudDetectionService
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


def test_explanation_service_returns_consistent_decision():
    transaction_id = uuid4()
    transaction = SimpleNamespace(
        id=transaction_id,
        transaction_reference="test",
        amount=Decimal("125.00"),
        currency="USD",
        merchant="Test Merchant",
        merchant_category="Retail",
        transaction_type="purchase",
        status=SimpleNamespace(value="pending"),
    )

    class TransactionStub:
        def get_transaction(self, db, requested_id):
            assert requested_id == transaction_id
            return transaction

    class ModelStub:
        settings = SimpleNamespace(FRAUD_THRESHOLD=0.50)

        def get_model_for_inference(self, db):
            return SimpleNamespace(version="dev"), DemoFraudModel()

    service = FraudDetectionService(
        transaction_service=TransactionStub(),
        ml_model_service=ModelStub(),
    )
    result = service.explain_transaction(SimpleNamespace(), transaction_id)

    assert result["transaction_id"] == transaction_id
    assert result["raw_score"] == 0.15
    assert result["fraud_probability"] == 0.5374298453437496
    assert result["threshold"] == 0.50
    assert result["decision"] == "fraud"
    assert result["contributions"] == [
        {
            "feature": "status",
            "value": "pending",
            "contribution": 0.15,
            "reason": "Transaction is pending or requires review",
        }
    ]


def test_explanation_endpoint_returns_model_contract(monkeypatch):
    transaction_id = uuid4()
    expected = {
        "transaction_id": transaction_id,
        "model_version": "dev",
        "threshold": 0.5,
        "raw_score": 0.15,
        "fraud_probability": 0.5374298453437496,
        "decision": "fraud",
        "contributions": [{
            "feature": "status",
            "value": "pending",
            "contribution": 0.15,
            "reason": "Transaction is pending or requires review",
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
