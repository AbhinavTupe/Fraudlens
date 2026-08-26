from __future__ import annotations

from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.base import BaseRepository
from app.models import InvestigationCase


class InvestigationCaseRepository(BaseRepository[InvestigationCase]):
    def __init__(self) -> None:
        super().__init__(InvestigationCase)

    def get_open_cases(self, db: Session, limit: int = 100) -> List[InvestigationCase]:
        stmt = select(InvestigationCase).where(InvestigationCase.status == "open").limit(limit)
        return list(db.scalars(stmt).all())

    def get_by_assigned_user(self, db: Session, user_id, limit: int = 100) -> List[InvestigationCase]:
        stmt = select(InvestigationCase).where(InvestigationCase.assigned_to == user_id).limit(limit)
        return list(db.scalars(stmt).all())
