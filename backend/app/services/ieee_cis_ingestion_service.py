from __future__ import annotations

import uuid
from decimal import Decimal
from typing import Any

from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.crud.ml_feature_record import MLFeatureRecordRepository
from app.models import IeeeCisSourceTransaction, MLFeatureRecord, Transaction
from app.models.enums import TransactionStatus
from app.schemas.ml_feature_record import MLFeatureRecordCreate

SOURCE_DATASET = "IEEE-CIS Fraud Detection"
FEATURE_CONTRACT_VERSION = "fraudlens-v2.2.1"
FEATURE_VERSION = "ieee-cis-v1"
RAW_FEATURE_COLUMNS = [
    "TransactionAmt",
    "ProductCD",
    *[f"C{i}" for i in range(1, 15)],
]


class IeeeCisIngestionError(ValueError):
    pass


class DuplicateIeeeCisSourceError(IeeeCisIngestionError):
    pass


class IncompleteIeeeCisRowError(IeeeCisIngestionError):
    pass


def _required_value(row: dict[str, Any], column: str) -> Any:
    if column not in row or row[column] is None:
        raise IncompleteIeeeCisRowError(f"IEEE-CIS row is missing required field {column}")
    try:
        if bool(row[column] != row[column]):
            raise IncompleteIeeeCisRowError(f"IEEE-CIS row is missing required field {column}")
    except TypeError:
        pass
    return row[column]


def _build_feature_payload(row: dict[str, Any], transaction_id) -> MLFeatureRecordCreate:
    values = {column: _required_value(row, column) for column in RAW_FEATURE_COLUMNS}
    try:
        return MLFeatureRecordCreate(
            transaction_id=transaction_id,
            source_dataset=SOURCE_DATASET,
            source_transaction_id=int(_required_value(row, "TransactionID")),
            feature_contract_version=FEATURE_CONTRACT_VERSION,
            feature_version=FEATURE_VERSION,
            transaction_amt=Decimal(str(values["TransactionAmt"])),
            product_cd=str(values["ProductCD"]),
            **{f"c{i}": Decimal(str(values[f"C{i}"])) for i in range(1, 15)},
        )
    except (ValidationError, ValueError, TypeError) as exc:
        raise IncompleteIeeeCisRowError(f"Invalid IEEE-CIS ML feature payload: {exc}") from exc


def ingest_ieee_cis_row(db: Session, row: dict[str, Any]) -> tuple[Transaction, IeeeCisSourceTransaction, MLFeatureRecord]:
    source_transaction_id = int(_required_value(row, "TransactionID"))
    transaction_dt = int(_required_value(row, "TransactionDT"))
    existing = MLFeatureRecordRepository().get_by_source_contract(
        db, SOURCE_DATASET, source_transaction_id, FEATURE_CONTRACT_VERSION
    )
    if existing is not None:
        raise DuplicateIeeeCisSourceError(
            f"IEEE-CIS transaction {source_transaction_id} already ingested for {FEATURE_CONTRACT_VERSION}"
        )

    transaction = Transaction(
        id=uuid.uuid4(),
        transaction_reference=f"ieee-cis-{source_transaction_id}",
        amount=Decimal(str(_required_value(row, "TransactionAmt"))),
        currency=None,
        merchant=None,
        merchant_category=None,
        customer_id=None,
        transaction_type=None,
        transaction_timestamp=None,
        location=None,
        payment_method=None,
        status=TransactionStatus.PENDING,
    )
    feature_payload = _build_feature_payload(row, transaction.id)
    source_record = IeeeCisSourceTransaction(
        source_dataset=SOURCE_DATASET,
        source_transaction_id=source_transaction_id,
        transaction_dt=transaction_dt,
        transaction=transaction,
    )
    db.add(source_record)
    feature_record = MLFeatureRecord(**feature_payload.model_dump())
    db.add(feature_record)
    try:
        db.flush()
    except IntegrityError as exc:
        raise DuplicateIeeeCisSourceError(
            f"IEEE-CIS transaction {source_transaction_id} conflicts with an existing ingestion"
        ) from exc
    return transaction, source_record, feature_record
