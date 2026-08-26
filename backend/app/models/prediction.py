from __future__ import annotations

from datetime import datetime
import uuid
from typing import List, Optional

from sqlalchemy import DateTime, Float, ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import BaseModelMixin


class Prediction(Base, BaseModelMixin):
    __tablename__ = "predictions"

    transaction_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("transactions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        unique=True,
    )

    fraud_probability: Mapped[float] = mapped_column(Float, nullable=False)
    predicted_label: Mapped[str] = mapped_column(String(50), nullable=False)
    model_version: Mapped[str | None] = mapped_column(String(100), nullable=True)
    inference_time_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    threshold_used: Mapped[float | None] = mapped_column(Float, nullable=True)

    # relationships (1:1 with Transaction, 1:1 with FraudAlert)
    transaction: Mapped[Optional["Transaction"]] = relationship(
        "Transaction",
        back_populates="prediction",
        uselist=False,
        passive_deletes=True,
    )
    fraud_alert: Mapped[Optional["FraudAlert"]] = relationship(
        "FraudAlert",
        back_populates="prediction",
        uselist=False,
        cascade="all, delete-orphan",
    )

# transaction_id already has index=True on the mapped column; avoid duplicate Index declaration.
