from __future__ import annotations

from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.base import BaseRepository
from app.models import ActivityLog


class ActivityLogRepository(BaseRepository[ActivityLog]):
    def __init__(self) -> None:
        super().__init__(ActivityLog)

    def get_by_user(self, db: Session, user_id, limit: int = 100) -> List[ActivityLog]:
        stmt = select(ActivityLog).where(ActivityLog.user_id == user_id).limit(limit)
        return list(db.scalars(stmt).all())
