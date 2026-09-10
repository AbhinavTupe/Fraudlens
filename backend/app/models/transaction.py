from __future__ import annotations

import uuid
from decimal import Decimal
from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Numeric,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import BaseModelMixin
from app.models.enums import TransactionStatus


class Transaction(Base, BaseModelMixin):
    __tablename__ = "transactions"

    transaction_reference: Mapped[str] = mapped_column(String(128), nullable=False, unique=True, index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    currency: Mapped[str | None] = mapped_column(String(3), nullable=True)
    merchant: Mapped[str | None] = mapped_column(String(255), nullable=True)
    merchant_category: Mapped[str | None] = mapped_column(String(100), nullable=True)

    customer_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    transaction_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    transaction_timestamp: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    payment_method: Mapped[str | None] = mapped_column(String(100), nullable=True)

    status: Mapped[TransactionStatus] = mapped_column(Enum(TransactionStatus, native_enum=False), nullable=False, default=TransactionStatus.PENDING, index=True)

    # Relationships
    user: Mapped[Optional["User"]] = relationship("User", back_populates="transactions", passive_deletes=True)
    prediction: Mapped[Optional["Prediction"]] = relationship(
        "Prediction",
        back_populates="transaction",
        uselist=False,
        cascade="all, delete-orphan",
    )
    fraud_alerts: Mapped[List["FraudAlert"]] = relationship(
        "FraudAlert",
        back_populates="transaction",
        cascade="all, delete-orphan",
    )


# Note: `customer_id` already has `index=True` on the mapped column; avoid duplicate explicit Index declaration.
