from __future__ import annotations

from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.base import BaseRepository
from app.models import Prediction


class PredictionRepository(BaseRepository[Prediction]):
    def __init__(self) -> None:
        super().__init__(Prediction)

    def get_by_transaction(self, db: Session, transaction_id) -> Optional[Prediction]:
        stmt = select(Prediction).where(Prediction.transaction_id == transaction_id)
        return db.scalars(stmt).one_or_none()
