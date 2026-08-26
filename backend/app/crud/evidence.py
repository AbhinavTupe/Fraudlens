from __future__ import annotations

from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.base import BaseRepository
from app.models import Evidence


class EvidenceRepository(BaseRepository[Evidence]):
    def __init__(self) -> None:
        super().__init__(Evidence)

    def get_by_case(self, db: Session, case_id, limit: int = 100) -> List[Evidence]:
        stmt = select(Evidence).where(Evidence.case_id == case_id).limit(limit)
        return list(db.scalars(stmt).all())
