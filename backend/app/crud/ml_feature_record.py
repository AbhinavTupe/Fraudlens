from __future__ import annotations

from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.base import BaseRepository
from app.models import MLFeatureRecord


class MLFeatureRecordRepository(BaseRepository[MLFeatureRecord]):
    def __init__(self) -> None:
        super().__init__(MLFeatureRecord)

    def get_by_source_contract(
        self,
        db: Session,
        source_dataset: str,
        source_transaction_id: int,
        feature_contract_version: str,
    ) -> Optional[MLFeatureRecord]:
        stmt = select(MLFeatureRecord).where(
            MLFeatureRecord.source_dataset == source_dataset,
            MLFeatureRecord.source_transaction_id == source_transaction_id,
            MLFeatureRecord.feature_contract_version == feature_contract_version,
        )
        return db.scalars(stmt).one_or_none()

    def get_by_transaction_contract(
        self,
        db: Session,
        transaction_id,
        feature_contract_version: str,
    ) -> Optional[MLFeatureRecord]:
        stmt = select(MLFeatureRecord).where(
            MLFeatureRecord.transaction_id == transaction_id,
            MLFeatureRecord.feature_contract_version == feature_contract_version,
        )
        return db.scalars(stmt).one_or_none()
