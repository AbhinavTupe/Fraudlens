from __future__ import annotations

from decimal import Decimal

import pytest

from app.db.session import SessionLocal
from app.models import IeeeCisSourceTransaction, MLFeatureRecord
from app.services.ieee_cis_ingestion_service import (
    DuplicateIeeeCisSourceError,
    IncompleteIeeeCisRowError,
    ingest_ieee_cis_row,
)


def _row(source_id: int = 987654321):
    return {
        "TransactionID": source_id,
        "TransactionDT": 86400,
        "TransactionAmt": 68.5,
        "ProductCD": "W",
        **{f"C{i}": float(i % 3) for i in range(1, 15)},
    }


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


def test_ingestion_persists_source_link_and_all_raw_features(db):
    transaction, source, feature = ingest_ieee_cis_row(db, _row())

    assert source.transaction_id == transaction.id
    assert source.source_transaction_id == 987654321
    assert feature.transaction_id == transaction.id
    assert feature.source_transaction_id == source.source_transaction_id
    assert feature.feature_contract_version == "fraudlens-v2.2.1"
    assert feature.transaction_amt == Decimal("68.50")
    assert feature.product_cd == "W"
    assert [getattr(feature, f"c{i}") for i in range(1, 15)] == [Decimal(str(i % 3)) for i in range(1, 15)]
    assert transaction.currency is None
    assert transaction.transaction_timestamp is None


def test_duplicate_source_transaction_is_rejected(db):
    ingest_ieee_cis_row(db, _row(987654322))

    with pytest.raises(DuplicateIeeeCisSourceError):
        ingest_ieee_cis_row(db, _row(987654322))


def test_incomplete_feature_payload_is_rejected_without_persistence(db):
    row = _row(987654323)
    del row["C14"]

    with pytest.raises(IncompleteIeeeCisRowError):
        ingest_ieee_cis_row(db, row)

    assert db.query(IeeeCisSourceTransaction).filter_by(source_transaction_id=987654323).count() == 0
    assert db.query(MLFeatureRecord).filter_by(source_transaction_id=987654323).count() == 0
