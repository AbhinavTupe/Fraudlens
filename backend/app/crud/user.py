from __future__ import annotations

from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.base import BaseRepository
from app.models import User


class UserRepository(BaseRepository[User]):
    def __init__(self) -> None:
        super().__init__(User)

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email)
        return db.scalars(stmt).one_or_none()
