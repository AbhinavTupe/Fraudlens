from __future__ import annotations

from types import SimpleNamespace
from uuid import UUID, uuid4

from fastapi.testclient import TestClient

from app.api import auth as auth_module
from app.api.routers import transactions as transactions_router
from app.db.session import SessionLocal
from app.main import app
from app.models import Transaction
from app.models.enums import UserRole


TRANSACTION_ID = UUID("37b63ee8-c2f9-40f4-9036-115475ebc9b9")


def _authorized_client(monkeypatch):
    monkeypatch.setattr(auth_module, "UserService", lambda: SimpleNamespace(
        get_user_by_email=lambda db, email: SimpleNamespace(
            id=uuid4(), email=email, role=UserRole.ADMIN, status="active"
        ),
        validate_account=lambda db, user: user,
    ))
    token = auth_module.create_access_token("admin@example.com", UserRole.ADMIN)
    return TestClient(app), {"Authorization": f"Bearer {token}"}


def test_real_persisted_transaction_returns_v23_shap_explanation(monkeypatch):
    client, headers = _authorized_client(monkeypatch)
    response = client.get(f"/api/transactions/{TRANSACTION_ID}/explanation", headers=headers)

    assert response.status_code == 200
    payload = response.json()
    assert payload["transaction_id"] == str(TRANSACTION_ID)
    assert payload["model_version"] == "fraudlens-xgb-v2.2.2"
    assert payload["contract_version"] == "fraudlens-v2.2.1"
    assert payload["output_space"] == "raw XGBoost margin (log-odds)"
    assert payload["threshold"] == 0.883991003036499
    assert len(payload["contributions"]) == 20
    assert all(set(item) == {"feature_name", "feature_value", "shap_value", "direction"} for item in payload["contributions"])
    assert payload["contributions"] == sorted(
        payload["contributions"],
        key=lambda item: (-abs(item["shap_value"]), item["feature_name"]),
    )
    assert all(
        item["direction"] == ("fraud" if item["shap_value"] > 0 else "legitimate" if item["shap_value"] < 0 else "neutral")
        for item in payload["contributions"]
    )
    assert payload["decision"] == ("fraud" if payload["fraud_probability"] >= payload["threshold"] else "legit")


def test_ordinary_transaction_without_feature_record_returns_not_found(monkeypatch):
    db = SessionLocal()
    try:
        ordinary = db.query(Transaction).filter(Transaction.id != TRANSACTION_ID).first()
        assert ordinary is not None
        ordinary_id = ordinary.id
    finally:
        db.close()

    client, headers = _authorized_client(monkeypatch)
    response = client.get(f"/api/transactions/{ordinary_id}/explanation", headers=headers)
    assert response.status_code == 404


def test_unknown_transaction_returns_not_found(monkeypatch):
    client, headers = _authorized_client(monkeypatch)
    response = client.get(f"/api/transactions/{uuid4()}/explanation", headers=headers)
    assert response.status_code == 404


def test_repeated_explanation_is_identical(monkeypatch):
    client, headers = _authorized_client(monkeypatch)
    first = client.get(f"/api/transactions/{TRANSACTION_ID}/explanation", headers=headers)
    second = client.get(f"/api/transactions/{TRANSACTION_ID}/explanation", headers=headers)
    assert first.status_code == second.status_code == 200
    assert first.json() == second.json()
