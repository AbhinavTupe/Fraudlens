from __future__ import annotations

from io import BytesIO
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from app.api import auth as auth_module
from app.main import app
from app.models.enums import UserRole


class StubUserService:
    def get_user_by_email(self, db, email):
        return type(
            "User",
            (),
            {
                "id": uuid4(),
                "email": email,
                "full_name": "Batch Upload User",
                "password_hash": auth_module.hash_password("secret-pass"),
                "role": UserRole.ADMIN,
                "status": "active",
                "created_at": "2024-01-01T00:00:00",
                "updated_at": "2024-01-01T00:00:00",
                "last_login": None,
            },
        )()

    def validate_account(self, db, user):
        return user


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setattr(auth_module, "UserService", StubUserService)
    with TestClient(app) as test_client:
        yield test_client


def _token():
    return auth_module.create_access_token("admin@example.com", UserRole.ADMIN)


def _csv_payload(rows: list[str] | str, filename: str = "transactions.csv"):
    data = rows if isinstance(rows, str) else "\n".join(rows)
    return {"file": (filename, data.encode("utf-8"), "text/csv")}


def test_batch_upload_accepts_valid_csv_and_persists_rows(client):
    ref_1 = f"batch-valid-{uuid4().hex}"
    ref_2 = f"batch-valid-{uuid4().hex}"
    rows = [
        "transaction_reference,amount,currency,merchant,merchant_category,customer_id,transaction_type,transaction_timestamp,location,payment_method,status",
        f"{ref_1},99.99,USD,Baseline Merchant,Retail,,purchase,2026-08-12T10:00:00Z,Boston,card,pending",
        f"{ref_2},45.50,USD,Northwind,Electronics,,wire,2026-08-12T11:30:00+00:00,Denver,bank,approved",
    ]

    response = client.post(
        "/api/transactions/batch-upload",
        files=_csv_payload(rows),
        headers={"Authorization": f"Bearer {_token()}"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["successfully_imported"] == 2
    assert payload["failed_rows"] == 0
    assert len(payload["imported_ids"]) == 2


def test_batch_upload_rejects_missing_required_column(client):
    rows = [
        "transaction_reference,amount,currency,merchant,transaction_timestamp",
        f"batch-missing-col-{uuid4().hex},99.99,USD,Example Merchant,2026-08-12T10:00:00Z",
    ]

    response = client.post(
        "/api/transactions/batch-upload",
        files=_csv_payload(rows),
        headers={"Authorization": f"Bearer {_token()}"},
    )

    assert response.status_code == 400
    payload = response.json()
    assert payload["failed_rows"] == 1
    assert any(err["field"] == "status" for err in payload["validation_errors"])


def test_batch_upload_rejects_invalid_amount(client):
    ref = f"batch-invalid-amount-{uuid4().hex}"
    rows = [
        "transaction_reference,amount,currency,merchant,merchant_category,customer_id,transaction_type,transaction_timestamp,location,payment_method,status",
        f"{ref},not-a-number,USD,Example Merchant,Retail,,purchase,2026-08-12T10:00:00Z,Boston,card,pending",
    ]

    response = client.post(
        "/api/transactions/batch-upload",
        files=_csv_payload(rows),
        headers={"Authorization": f"Bearer {_token()}"},
    )

    assert response.status_code == 400
    payload = response.json()
    assert payload["failed_rows"] == 1
    assert any(err["field"] == "amount" for err in payload["validation_errors"])


def test_batch_upload_rejects_invalid_timestamp(client):
    ref = f"batch-invalid-ts-{uuid4().hex}"
    rows = [
        "transaction_reference,amount,currency,merchant,merchant_category,customer_id,transaction_type,transaction_timestamp,location,payment_method,status",
        f"{ref},42.00,USD,Example Merchant,Retail,,purchase,invalid-timestamp,Boston,card,pending",
    ]

    response = client.post(
        "/api/transactions/batch-upload",
        files=_csv_payload(rows),
        headers={"Authorization": f"Bearer {_token()}"},
    )

    assert response.status_code == 400
    payload = response.json()
    assert any(err["field"] == "transaction_timestamp" for err in payload["validation_errors"])


def test_batch_upload_rejects_invalid_enum(client):
    ref = f"batch-invalid-enum-{uuid4().hex}"
    rows = [
        "transaction_reference,amount,currency,merchant,merchant_category,customer_id,transaction_type,transaction_timestamp,location,payment_method,status",
        f"{ref},10.00,USD,Example Merchant,Retail,,purchase,2026-08-12T10:00:00Z,Boston,card,not-a-status",
    ]

    response = client.post(
        "/api/transactions/batch-upload",
        files=_csv_payload(rows),
        headers={"Authorization": f"Bearer {_token()}"},
    )

    assert response.status_code == 400
    payload = response.json()
    assert any(err["field"] == "status" for err in payload["validation_errors"])


def test_batch_upload_rejects_duplicate_reference(client):
    ref = f"batch-duplicate-{uuid4().hex}"
    rows = [
        "transaction_reference,amount,currency,merchant,merchant_category,customer_id,transaction_type,transaction_timestamp,location,payment_method,status",
        f"{ref},10.00,USD,Example Merchant,Retail,,purchase,2026-08-12T10:00:00Z,Boston,card,pending",
        f"{ref},12.00,USD,Second Merchant,Retail,,purchase,2026-08-12T11:00:00Z,Seattle,card,pending",
    ]

    response = client.post(
        "/api/transactions/batch-upload",
        files=_csv_payload(rows),
        headers={"Authorization": f"Bearer {_token()}"},
    )

    assert response.status_code == 400
    payload = response.json()
    assert payload["failed_rows"] == 2
    assert any("duplicate" in str(err["error"]).lower() for err in payload["validation_errors"])


def test_batch_upload_requires_authentication(client):
    rows = [
        "transaction_reference,amount,currency,merchant,merchant_category,customer_id,transaction_type,transaction_timestamp,location,payment_method,status",
        f"batch-noauth-{uuid4().hex},12.00,USD,Example Merchant,Retail,,purchase,2026-08-12T10:00:00Z,Boston,card,pending",
    ]

    response = client.post("/api/transactions/batch-upload", files=_csv_payload(rows))

    assert response.status_code == 401


def test_create_transaction_endpoint_still_works(client):
    payload = {
        "transaction_reference": f"single-create-{uuid4().hex}",
        "amount": "14.75",
        "currency": "USD",
        "merchant": "Example Merchant",
        "merchant_category": "Retail",
        "customer_id": None,
        "transaction_type": "purchase",
        "transaction_timestamp": "2026-08-12T10:00:00Z",
        "location": "Boston",
        "payment_method": "card",
        "status": "pending",
    }

    response = client.post(
        "/api/transactions",
        json=payload,
        headers={"Authorization": f"Bearer {_token()}"},
    )

    assert response.status_code == 201
    assert response.json()["transaction_reference"] == payload["transaction_reference"]
