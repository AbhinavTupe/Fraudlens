from __future__ import annotations

from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.base import BaseRepository
from app.models import Setting


class SettingRepository(BaseRepository[Setting]):
    def __init__(self) -> None:
        super().__init__(Setting)

    def get_by_user(self, db: Session, user_id) -> Optional[Setting]:
        stmt = select(Setting).where(Setting.user_id == user_id)
        return db.scalars(stmt).one_or_none()
