from __future__ import annotations

from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.base import BaseRepository
from app.models import FraudAlert


class FraudAlertRepository(BaseRepository[FraudAlert]):
    def __init__(self) -> None:
        super().__init__(FraudAlert)

    def get_open_alerts(self, db: Session, limit: int = 100) -> List[FraudAlert]:
        stmt = select(FraudAlert).where(FraudAlert.status == "open").limit(limit)
        return list(db.scalars(stmt).all())

    def get_by_severity(self, db: Session, severity: str, limit: int = 100) -> List[FraudAlert]:
        stmt = select(FraudAlert).where(FraudAlert.severity == severity).limit(limit)
        return list(db.scalars(stmt).all())

    def get_by_status(self, db: Session, status: str, limit: int = 100) -> List[FraudAlert]:
        stmt = select(FraudAlert).where(FraudAlert.status == status).limit(limit)
        return list(db.scalars(stmt).all())
