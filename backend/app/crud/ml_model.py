from __future__ import annotations

from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.base import BaseRepository
from app.models import MLModel


class MLModelRepository(BaseRepository[MLModel]):
    def __init__(self) -> None:
        super().__init__(MLModel)

    def get_active_model(self, db: Session) -> Optional[MLModel]:
        stmt = select(MLModel).where(MLModel.is_active == True)
        return db.scalars(stmt).one_or_none()

    def get_by_version(self, db: Session, version: str) -> List[MLModel]:
        stmt = select(MLModel).where(MLModel.version == version)
        return list(db.scalars(stmt).all())
