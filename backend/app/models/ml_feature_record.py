from __future__ import annotations

import uuid
from decimal import Decimal

from sqlalchemy import BigInteger, ForeignKey, Index, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import BaseModelMixin


class MLFeatureRecord(Base, BaseModelMixin):
    __tablename__ = "ml_feature_records"
    __table_args__ = (
        UniqueConstraint(
            "source_dataset",
            "source_transaction_id",
            "feature_contract_version",
            name="uq_ml_feature_records_source_contract",
        ),
        Index("ix_ml_feature_records_transaction_id", "transaction_id"),
    )

    transaction_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("transactions.id", ondelete="CASCADE"), nullable=False
    )
    source_dataset: Mapped[str] = mapped_column(String(255), nullable=False)
    source_transaction_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    feature_contract_version: Mapped[str] = mapped_column(String(100), nullable=False)
    feature_version: Mapped[str] = mapped_column(String(100), nullable=False)

    transaction_amt: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    product_cd: Mapped[str] = mapped_column(String(1), nullable=False)
    c1: Mapped[Decimal] = mapped_column(Numeric(20, 6), nullable=False)
    c2: Mapped[Decimal] = mapped_column(Numeric(20, 6), nullable=False)
    c3: Mapped[Decimal] = mapped_column(Numeric(20, 6), nullable=False)
    c4: Mapped[Decimal] = mapped_column(Numeric(20, 6), nullable=False)
    c5: Mapped[Decimal] = mapped_column(Numeric(20, 6), nullable=False)
    c6: Mapped[Decimal] = mapped_column(Numeric(20, 6), nullable=False)
    c7: Mapped[Decimal] = mapped_column(Numeric(20, 6), nullable=False)
    c8: Mapped[Decimal] = mapped_column(Numeric(20, 6), nullable=False)
    c9: Mapped[Decimal] = mapped_column(Numeric(20, 6), nullable=False)
    c10: Mapped[Decimal] = mapped_column(Numeric(20, 6), nullable=False)
    c11: Mapped[Decimal] = mapped_column(Numeric(20, 6), nullable=False)
    c12: Mapped[Decimal] = mapped_column(Numeric(20, 6), nullable=False)
    c13: Mapped[Decimal] = mapped_column(Numeric(20, 6), nullable=False)
    c14: Mapped[Decimal] = mapped_column(Numeric(20, 6), nullable=False)

    transaction: Mapped["Transaction"] = relationship("Transaction")


from app.models.transaction import Transaction
