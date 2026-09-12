from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.crud.transaction import TransactionRepository
from app.crud.user import UserRepository
from app.models import Transaction
from app.models.enums import TransactionStatus


class TransactionNotFoundError(Exception):
    pass


class DuplicateTransactionError(Exception):
    pass


class TransactionService:
    def __init__(self, transaction_repo: Optional[TransactionRepository] = None, user_repo: Optional[UserRepository] = None) -> None:
        self.transaction_repo = transaction_repo or TransactionRepository()
        self.user_repo = user_repo or UserRepository()

    def get_transaction(self, db: Session, transaction_id: UUID) -> Transaction:
        transaction = self.transaction_repo.get_by_id(db, transaction_id)
        if transaction is None:
            raise TransactionNotFoundError(f"Transaction {transaction_id} was not found")
        return transaction

    def list_transactions(self, db: Session, limit: int = 100, offset: int = 0) -> list[Transaction]:
        return self.transaction_repo.paginate(
            db,
            limit=limit,
            offset=offset,
            order_by=Transaction.transaction_timestamp.desc(),
        )

    def count_transactions(self, db: Session) -> int:
        return self.transaction_repo.count(db)

    def create_transaction(
        self,
        db: Session,
        *,
        transaction_reference: str,
        amount: Decimal,
        currency: str,
        merchant: Optional[str],
        merchant_category: Optional[str],
        customer_id: Optional[UUID],
        transaction_type: Optional[str],
        location: Optional[str],
        payment_method: Optional[str],
        transaction_timestamp: Optional[datetime] = None,
        status: TransactionStatus = TransactionStatus.PENDING,
        validate_customer: bool = True,
    ) -> Transaction:
        existing = self.transaction_repo.get_by_reference(db, transaction_reference)
        if existing is not None:
            raise DuplicateTransactionError(f"Transaction {transaction_reference} already exists")
        if validate_customer and customer_id is not None and self.user_repo.get_by_id(db, customer_id) is None:
            raise TransactionNotFoundError(f"Customer {customer_id} was not found")
        payload = {
            "transaction_reference": transaction_reference,
            "amount": amount,
            "currency": currency,
            "merchant": merchant,
            "merchant_category": merchant_category,
            "customer_id": customer_id,
            "transaction_type": transaction_type,
            "transaction_timestamp": transaction_timestamp or datetime.utcnow(),
            "location": location,
            "payment_method": payment_method,
            "status": status,
        }
        return self.transaction_repo.create(db, payload)

    def update_transaction_status(self, db: Session, transaction_id: UUID, status: TransactionStatus, commit: bool = True) -> Transaction:
        transaction = self.get_transaction(db, transaction_id)
        updated = self.transaction_repo.update(db, transaction, {"status": status}, commit=commit)
        return updated
