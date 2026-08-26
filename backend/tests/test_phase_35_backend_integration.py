from __future__ import annotations

from decimal import Decimal
from types import SimpleNamespace
from uuid import UUID, uuid4

import pytest
from fastapi.testclient import TestClient

from app.api import auth as auth_module
from app.api.routers import auth as auth_router
from app.api.routers import transactions as transactions_router
from app.api.routers import users as users_router
from app.config import get_settings
from app.db.session import SessionLocal
from app.main import app
from app.models import FraudAlert, MLModel, Prediction, Transaction
from app.models.enums import TransactionStatus, UserRole
from app.services.fraud_detection_service import FraudDetectionService
from app.services.transaction_service import TransactionService


class StubRepo:
    def get_multi(self, db, limit=100, offset=0):
        return []


class StubUserService:
    def __init__(self, *args, **kwargs):
        self.user_repo = StubRepo()

    def get_user_by_email(self, db, email):
        return SimpleNamespace(id="user-1", email=email, role=self.role)

    def validate_account(self, db, user):
        return user


class StubAdminService(StubUserService):
    role = UserRole.ADMIN


class StubAnalystService(StubUserService):
    role = UserRole.ANALYST


class StubUserServiceWithRepo(StubUserService):
    role = UserRole.REVIEWER


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def db_override():
    def override_get_db():
        yield SimpleNamespace()

    return override_get_db


def test_health_openapi_and_missing_route(client):
    assert client.get("/health").status_code == 200
    assert client.get("/openapi.json").status_code == 200
    assert client.get("/definitely-missing").status_code == 404


def test_login_endpoint_returns_access_token_for_valid_credentials(client, monkeypatch):
    class StubUserService:
        def get_user_by_email(self, db, email):
            return SimpleNamespace(
                id=uuid4(),
                email=email,
                full_name="Integration User",
                password_hash=auth_module.hash_password("secret-pass"),
                role=UserRole.ADMIN,
                status="active",
                created_at="2024-01-01T00:00:00",
                updated_at="2024-01-01T00:00:00",
                last_login=None,
            )

    monkeypatch.setattr(auth_router, "UserService", StubUserService)

    response = client.post("/api/login", json={"email": "admin@example.com", "password": "secret-pass"})

    assert response.status_code == 200
    payload = response.json()
    assert payload["token_type"] == "bearer"
    assert payload["user"]["email"] == "admin@example.com"
    assert payload["access_token"]


def test_missing_and_invalid_token_are_rejected(client, db_override, monkeypatch):
    monkeypatch.setattr(auth_module, "get_db", db_override)
    monkeypatch.setattr(users_router, "get_db", db_override)
    monkeypatch.setattr(auth_module, "UserService", StubUserServiceWithRepo)
    monkeypatch.setattr(users_router, "UserService", StubUserServiceWithRepo)

    assert client.get("/api/users").status_code == 401
    assert client.get("/api/users", headers={"Authorization": "Bearer invalid"}).status_code == 401


def test_allowed_role_token_is_accepted(client, db_override, monkeypatch):
    monkeypatch.setattr(auth_module, "get_db", db_override)
    monkeypatch.setattr(users_router, "get_db", db_override)
    monkeypatch.setattr(auth_module, "UserService", StubAdminService)
    monkeypatch.setattr(users_router, "UserService", StubUserServiceWithRepo)

    token = auth_module.create_access_token("admin@example.com", UserRole.ADMIN)
    response = client.get("/api/users", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200


def test_insufficient_role_token_is_forbidden(client, db_override, monkeypatch):
    monkeypatch.setattr(auth_module, "get_db", db_override)
    monkeypatch.setattr(users_router, "get_db", db_override)
    monkeypatch.setattr(auth_module, "UserService", StubAnalystService)
    monkeypatch.setattr(users_router, "UserService", StubUserServiceWithRepo)

    token = auth_module.create_access_token("analyst@example.com", UserRole.ANALYST)
    response = client.get("/api/users", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 403
    assert response.json()["detail"] == "Insufficient permissions"


def test_evaluation_route_returns_prediction_response_schema(client, db_override, monkeypatch):
    monkeypatch.setattr(auth_module, "get_db", db_override)
    monkeypatch.setattr(transactions_router, "get_db", db_override)
    monkeypatch.setattr(auth_module, "UserService", StubAdminService)

    class StubFraudDetectionService:
        def evaluate_transaction(self, db, transaction_id):
            transaction = SimpleNamespace(id=transaction_id)
            prediction = SimpleNamespace(
                id="00000000-0000-0000-0000-000000000001",
                transaction_id=transaction_id,
                fraud_probability=0.91,
                predicted_label="fraud",
                model_version="v1",
                inference_time_ms=12,
                threshold_used=0.5,
                created_at="2024-01-01T00:00:00",
                updated_at="2024-01-01T00:00:00",
            )
            return transaction, prediction, None

    monkeypatch.setattr(transactions_router, "FraudDetectionService", StubFraudDetectionService)

    token = auth_module.create_access_token("admin@example.com", UserRole.ADMIN)
    response = client.post(
        "/api/transactions/00000000-0000-0000-0000-000000000999/evaluate",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert response.json()["predicted_label"] == "fraud"
    assert response.json()["fraud_probability"] == 0.91


def _ensure_single_active_model(db):
    active_models = db.query(MLModel).filter(MLModel.is_active.is_(True)).all()
    for model in active_models:
        model.is_active = False
    if active_models:
        db.commit()


def test_settings_expose_default_fraud_threshold():
    settings = get_settings()

    assert settings.FRAUD_THRESHOLD == 0.50


def test_real_fraud_detection_workflow_persists_prediction_alert_and_status():
    db = SessionLocal()
    try:
        transaction_service = TransactionService()
        transaction = transaction_service.create_transaction(
            db,
            transaction_reference=f"phase-35-real-workflow-{uuid4().hex}",
            amount=Decimal("125.00"),
            currency="USD",
            merchant="Test Merchant",
            merchant_category="Retail",
            customer_id=None,
            transaction_type="purchase",
            location="New York",
            payment_method="card",
            status=TransactionStatus.PENDING,
        )

        _ensure_single_active_model(db)

        ml_model = MLModel(
            name=f"fraud-model-{uuid4().hex}",
            version="dev",
            algorithm="random_forest",
            description="development integration artifact",
            artifact_path="app/ml/artifacts/fraud_model.joblib",
            is_active=True,
            accuracy=0.95,
        )
        db.add(ml_model)
        db.commit()
        db.refresh(ml_model)

        service_db = SessionLocal()
        try:
            service = FraudDetectionService()
            _, prediction, alert = service.evaluate_transaction(service_db, transaction.id)
            transaction = service_db.get(Transaction, transaction.id)
            service_db.refresh(prediction)
            if alert is not None:
                service_db.refresh(alert)

            assert prediction.transaction_id == transaction.id
            assert prediction.threshold_used == pytest.approx(get_settings().FRAUD_THRESHOLD)
            assert prediction.fraud_probability >= 0.0
            assert prediction.predicted_label in {"fraud", "legit"}

            if alert is not None:
                assert alert.transaction_id == transaction.id
                assert alert.prediction_id == prediction.id
                assert transaction.status == TransactionStatus.REQUIRES_REVIEW
            else:
                assert transaction.status == TransactionStatus.PENDING

            duplicate_check_db = SessionLocal()
            try:
                with pytest.raises(ValueError):
                    service.evaluate_transaction(duplicate_check_db, transaction.id)
            finally:
                duplicate_check_db.rollback()
                duplicate_check_db.close()
        finally:
            service_db.rollback()
            service_db.close()
    finally:
        db.rollback()
        db.close()


def test_real_fraud_detection_rolls_back_on_failure(monkeypatch):
    db = SessionLocal()
    try:
        transaction_service = TransactionService()
        transaction = transaction_service.create_transaction(
            db,
            transaction_reference=f"phase-35-rollback-workflow-{uuid4().hex}",
            amount=Decimal("75.50"),
            currency="USD",
            merchant="Rollback Merchant",
            merchant_category="Retail",
            customer_id=None,
            transaction_type="purchase",
            location="Miami",
            payment_method="card",
            status=TransactionStatus.PENDING,
        )

        _ensure_single_active_model(db)

        ml_model = MLModel(
            name=f"fraud-model-{uuid4().hex}",
            version="dev",
            algorithm="random_forest",
            description="development integration artifact",
            artifact_path="app/ml/artifacts/fraud_model.joblib",
            is_active=True,
            accuracy=0.95,
        )
        db.add(ml_model)
        db.commit()
        db.refresh(ml_model)

        service_db = SessionLocal()
        try:
            service = FraudDetectionService()
            monkeypatch.setattr(service, "_infer_probability", lambda model_obj, features: (_ for _ in ()).throw(RuntimeError("boom")))

            with pytest.raises(RuntimeError):
                service.evaluate_transaction(service_db, transaction.id)

            prediction_count = service_db.query(Prediction).filter(Prediction.transaction_id == transaction.id).count()
            fraud_alert_count = service_db.query(FraudAlert).filter(FraudAlert.transaction_id == transaction.id).count()
            assert prediction_count == 0
            assert fraud_alert_count == 0
        finally:
            service_db.rollback()
            service_db.close()
    finally:
        db.rollback()
        db.close()
