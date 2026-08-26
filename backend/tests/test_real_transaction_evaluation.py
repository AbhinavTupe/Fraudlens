from __future__ import annotations

from uuid import uuid4

from fastapi.testclient import TestClient

from app.api.auth import create_access_token
from app.db.session import SessionLocal
from app.main import app
from app.models import MLModel, User
from app.models.enums import TransactionStatus, UserRole
from scripts.provision_dev_user import provision_development_user


def test_real_authenticated_transaction_evaluation_succeeds():
    db = SessionLocal()
    try:
        email = "dev-test@fraudlens.local"
        provision_development_user(db=db, email=email)
        user = db.query(User).filter(User.email == email).one()
        token = create_access_token(user.email, UserRole(user.role))

        active_models = db.query(MLModel).filter(MLModel.is_active.is_(True)).all()
        for model in active_models:
            model.is_active = False
        db.commit()

        model = MLModel(
            name=f"smoke-model-{uuid4().hex}",
            version="dev",
            algorithm="random_forest",
            description="smoke test model",
            artifact_path="app/ml/artifacts/fraud_model.joblib",
            is_active=True,
            accuracy=0.95,
        )
        db.add(model)
        db.commit()
        db.refresh(model)

        client = TestClient(app)
        payload = {
            "transaction_reference": f"smoke-eval-{uuid4().hex}",
            "amount": "125.00",
            "currency": "USD",
            "merchant": "Smoke Merchant",
            "merchant_category": "Retail",
            "customer_id": None,
            "transaction_type": "purchase",
            "transaction_timestamp": "2026-08-11T12:00:00Z",
            "location": "New York",
            "payment_method": "card",
            "status": TransactionStatus.PENDING.value,
        }

        create_resp = client.post(
            "/api/transactions",
            headers={"Authorization": f"Bearer {token}"},
            json=payload,
        )
        assert create_resp.status_code == 201
        transaction_id = create_resp.json()["id"]

        eval_resp = client.post(
            f"/api/transactions/{transaction_id}/evaluate",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert eval_resp.status_code == 200
        body = eval_resp.json()
        assert body["transaction_id"] == transaction_id
        assert body["predicted_label"] in {"fraud", "legit"}
    finally:
        db.close()
