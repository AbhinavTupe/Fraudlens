from __future__ import annotations

from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.base import BaseRepository
from app.models import Transaction


class TransactionRepository(BaseRepository[Transaction]):
    def __init__(self) -> None:
        super().__init__(Transaction)

    def get_by_reference(self, db: Session, reference: str) -> Optional[Transaction]:
        stmt = select(Transaction).where(Transaction.transaction_reference == reference)
        return db.scalars(stmt).one_or_none()

    def get_by_customer(self, db: Session, customer_id, limit: int = 100) -> List[Transaction]:
        stmt = select(Transaction).where(Transaction.customer_id == customer_id).limit(limit)
        return list(db.scalars(stmt).all())
