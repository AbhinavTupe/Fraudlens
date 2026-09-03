from __future__ import annotations

import csv
import io
from typing import Annotated, List
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.api.auth import get_current_user, require_roles
from app.crud.prediction import PredictionRepository
from app.dependencies import get_db
from app.models import User
from app.models.enums import UserRole
from app.schemas.transaction import (
    TransactionCreate,
    TransactionRead,
    TransactionUpdate,
    TransactionWorkspaceItem,
    TransactionWorkspaceResponse,
)
from app.schemas.prediction import PredictionRead
from app.schemas.explanation import TransactionExplanation
from app.services.fraud_detection_service import FraudDetectionService
from app.services.transaction_service import DuplicateTransactionError, TransactionNotFoundError, TransactionService

router = APIRouter(prefix="/transactions", tags=["transactions"])


def _batch_upload_response(total_rows: int, successful_rows: int, validation_errors: list[dict], imported_ids: list[str] | None = None) -> JSONResponse:
    payload = {
        "total_rows": total_rows,
        "successfully_imported": successful_rows,
        "failed_rows": max(0, total_rows - successful_rows),
        "validation_errors": validation_errors,
        "imported_ids": imported_ids or [],
    }
    return JSONResponse(content=payload, status_code=status.HTTP_400_BAD_REQUEST if validation_errors else status.HTTP_200_OK)


@router.post("/batch-upload")
def batch_upload_transactions(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.ADMIN, UserRole.ANALYST, UserRole.INVESTIGATOR, UserRole.REVIEWER))],
    file: UploadFile | None = File(default=None),
) -> JSONResponse:
    if file is None or file.filename is None or not file.filename:
        return _batch_upload_response(0, 0, [{"row_number": 0, "field": "file", "error": "A CSV file is required."}], [])

    filename = file.filename.lower()
    if not filename.endswith(".csv"):
        return _batch_upload_response(0, 0, [{"row_number": 0, "field": "file", "error": "Only .csv files are supported."}], [])

    raw = file.file.read()
    if not raw:
        return _batch_upload_response(0, 0, [{"row_number": 0, "field": "file", "error": "The uploaded file is empty."}], [])

    try:
        csv_text = raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        return _batch_upload_response(0, 0, [{"row_number": 0, "field": "file", "error": "The CSV file must use UTF-8 encoding."}], [])

    try:
        reader = csv.DictReader(io.StringIO(csv_text))
    except csv.Error:
        return _batch_upload_response(0, 0, [{"row_number": 0, "field": "file", "error": "The uploaded file is not valid CSV."}], [])

    if reader.fieldnames is None:
        return _batch_upload_response(0, 0, [{"row_number": 1, "field": "headers", "error": "CSV headers are required."}], [])

    fieldnames = [str(name).strip() for name in reader.fieldnames if name is not None]
    required_fields = list(TransactionCreate.model_fields.keys())
    missing_headers = [field for field in required_fields if field not in fieldnames]
    if missing_headers:
        validation_errors = [{"row_number": 1, "field": field, "error": "Missing required CSV column."} for field in missing_headers]
        return _batch_upload_response(1, 0, validation_errors, [])

    row_errors: dict[int, list[dict]] = {}
    valid_rows: list[dict] = []
    seen_references: set[str] = set()
    row_count = 0

    for row_number, row in enumerate(reader, start=2):
        if row is None or all((value is None or str(value).strip() == "") for value in row.values()):
            continue
        row_count += 1
        normalized = {
            str(key).strip(): (str(value).strip() if isinstance(value, str) else value)
            for key, value in row.items()
            if key is not None
        }

        payload = {
            "transaction_reference": normalized.get("transaction_reference"),
            "amount": normalized.get("amount"),
            "currency": normalized.get("currency"),
            "merchant": normalized.get("merchant"),
            "merchant_category": normalized.get("merchant_category"),
            "customer_id": normalized.get("customer_id") or None,
            "transaction_type": normalized.get("transaction_type"),
            "transaction_timestamp": normalized.get("transaction_timestamp"),
            "location": normalized.get("location"),
            "payment_method": normalized.get("payment_method"),
            "status": normalized.get("status"),
        }

        row_error_list: list[dict] = []
        try:
            TransactionCreate.model_validate(payload)
        except ValidationError as exc:
            for error in exc.errors():
                loc = error.get("loc", [])
                field = str(loc[0]) if loc else "value"
                message = error.get("msg", "Invalid value")
                row_error_list.append({"row_number": row_number, "field": field, "error": message})

        reference = (normalized.get("transaction_reference") or "").strip()
        if reference:
            if reference in seen_references:
                row_error_list.append({"row_number": row_number, "field": "transaction_reference", "error": "Duplicate transaction_reference in uploaded CSV."})
            seen_references.add(reference)

        if row_error_list:
            row_errors[row_number] = row_error_list
            continue

        valid_rows.append(payload)

    if row_errors:
        flattened = []
        for row_number in sorted(row_errors):
            flattened.extend(row_errors[row_number])
        return _batch_upload_response(row_count, 0, flattened, [])

    try:
        imported_ids: list[str] = []
        for row in valid_rows:
            transaction = TransactionService().create_transaction(
                db,
                transaction_reference=row["transaction_reference"],
                amount=row["amount"],
                currency=row["currency"],
                merchant=row["merchant"],
                merchant_category=row["merchant_category"],
                customer_id=row["customer_id"],
                transaction_type=row["transaction_type"],
                transaction_timestamp=row["transaction_timestamp"],
                location=row["location"],
                payment_method=row["payment_method"],
                status=row["status"],
            )
            imported_ids.append(str(transaction.id))
    except DuplicateTransactionError as exc:
        return _batch_upload_response(row_count, 0, [{"row_number": 0, "field": "transaction_reference", "error": str(exc)}], [])

    return _batch_upload_response(row_count, len(imported_ids), [], imported_ids)


@router.get("/workspace", response_model=TransactionWorkspaceResponse)
def list_workspace_transactions(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.ADMIN, UserRole.ANALYST, UserRole.INVESTIGATOR, UserRole.REVIEWER))],
    limit: int = 100,
    offset: int = 0,
) -> TransactionWorkspaceResponse:
    service = TransactionService()
    transactions = service.list_transactions(db, limit=limit, offset=offset)
    total = service.count_transactions(db)
    items: list[TransactionWorkspaceItem] = []

    for transaction in transactions:
        risk_score = None
        decision = None
        prediction = getattr(transaction, "prediction", None)
        if prediction is not None and prediction.fraud_probability is not None:
            risk_score = max(0, min(100, round(float(prediction.fraud_probability) * 100)))
            if risk_score >= 90:
                decision = "block"
            elif risk_score >= 70:
                decision = "review"
            else:
                decision = "approve"

        customer_name = None
        if transaction.customer_id is not None:
            customer = getattr(transaction, "user", None)
            if customer is not None:
                customer_name = customer.full_name

        items.append(
            TransactionWorkspaceItem(
                id=transaction.id,
                transaction_reference=transaction.transaction_reference,
                amount=transaction.amount,
                currency=transaction.currency,
                merchant=transaction.merchant,
                merchant_category=transaction.merchant_category,
                customer_id=transaction.customer_id,
                customer_name=customer_name,
                transaction_type=transaction.transaction_type,
                transaction_timestamp=transaction.transaction_timestamp,
                location=transaction.location,
                payment_method=transaction.payment_method,
                status=transaction.status,
                risk_score=risk_score,
                decision=decision,
            )
        )

    return TransactionWorkspaceResponse(items=items, total=total)


@router.get("/{transaction_id}", response_model=TransactionRead)
def get_transaction(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.ADMIN, UserRole.ANALYST, UserRole.INVESTIGATOR, UserRole.REVIEWER))],
    transaction_id: UUID,
) -> TransactionRead:
    service = TransactionService()
    try:
        return service.get_transaction(db, transaction_id)
    except TransactionNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("", response_model=TransactionRead, status_code=status.HTTP_201_CREATED)
def create_transaction(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.ADMIN, UserRole.ANALYST, UserRole.INVESTIGATOR, UserRole.REVIEWER))],
    payload: TransactionCreate,
) -> TransactionRead:
    service = TransactionService()
    try:
        return service.create_transaction(
            db,
            transaction_reference=payload.transaction_reference,
            amount=payload.amount,
            currency=payload.currency,
            merchant=payload.merchant,
            merchant_category=payload.merchant_category,
            customer_id=payload.customer_id,
            transaction_type=payload.transaction_type,
            transaction_timestamp=payload.transaction_timestamp,
            location=payload.location,
            payment_method=payload.payment_method,
            status=payload.status,
        )
    except DuplicateTransactionError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except TransactionNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.patch("/{transaction_id}", response_model=TransactionRead)
def update_transaction_status(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.ADMIN, UserRole.REVIEWER))],
    transaction_id: UUID,
    payload: TransactionUpdate,
) -> TransactionRead:
    service = TransactionService()
    if payload.status is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="status is required")
    try:
        return service.update_transaction_status(db, transaction_id, payload.status)
    except TransactionNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("/{transaction_id}/evaluate", response_model=PredictionRead)
def evaluate_transaction(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.ADMIN, UserRole.ANALYST, UserRole.INVESTIGATOR, UserRole.REVIEWER))],
    transaction_id: UUID,
) -> PredictionRead:
    service = FraudDetectionService()
    try:
        _, prediction, _ = service.evaluate_transaction(db, transaction_id)
        return prediction
    except TransactionNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get("/{transaction_id}/explanation", response_model=TransactionExplanation)
def explain_transaction(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.ADMIN, UserRole.ANALYST, UserRole.INVESTIGATOR, UserRole.REVIEWER))],
    transaction_id: UUID,
) -> TransactionExplanation:
    service = FraudDetectionService()
    try:
        return service.explain_transaction(db, transaction_id)
    except TransactionNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get("/evaluations/history", response_model=List[PredictionRead])
def get_evaluation_history(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(UserRole.ADMIN, UserRole.ANALYST, UserRole.INVESTIGATOR, UserRole.REVIEWER))],
    limit: Annotated[int, Query(ge=1, le=1000)] = 100,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> List[PredictionRead]:
    repo = PredictionRepository()
    predictions = repo.get_multi(db, limit=limit, offset=offset)
    return predictions
