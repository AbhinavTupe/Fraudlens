from __future__ import annotations

import uuid

from sqlalchemy import BigInteger, ForeignKey, Index, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import BaseModelMixin


class IeeeCisSourceTransaction(Base, BaseModelMixin):
    __tablename__ = "ieee_cis_source_transactions"
    __table_args__ = (
        UniqueConstraint(
            "source_dataset",
            "source_transaction_id",
            name="uq_ieee_cis_source_transactions_dataset_transaction",
        ),
        Index("ix_ieee_cis_source_transactions_transaction_id", "transaction_id"),
    )

    transaction_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("transactions.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    source_dataset: Mapped[str] = mapped_column(String(255), nullable=False)
    source_transaction_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    transaction_dt: Mapped[int] = mapped_column(BigInteger, nullable=False)

    transaction: Mapped["Transaction"] = relationship("Transaction")


from app.models.transaction import Transaction
