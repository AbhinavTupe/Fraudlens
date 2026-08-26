from __future__ import annotations

from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.base import BaseRepository
from app.models import FeatureImportance


class FeatureImportanceRepository(BaseRepository[FeatureImportance]):
    def __init__(self) -> None:
        super().__init__(FeatureImportance)

    def get_top_features(self, db: Session, model_id, limit: int = 10) -> List[FeatureImportance]:
        stmt = select(FeatureImportance).where(FeatureImportance.model_id == model_id).order_by(FeatureImportance.importance.desc()).limit(limit)
        return list(db.scalars(stmt).all())
