from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import BaseModelMixin
from app.models.enums import AlertSeverity, AlertStatus


class FraudAlert(Base, BaseModelMixin):
    __tablename__ = "fraud_alerts"

    transaction_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("transactions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    prediction_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("predictions.id", ondelete="SET NULL"),
        nullable=True,
        unique=True,
        index=True,
    )

    severity: Mapped[AlertSeverity] = mapped_column(Enum(AlertSeverity, native_enum=False), nullable=False, index=True)
    status: Mapped[AlertStatus] = mapped_column(Enum(AlertStatus, native_enum=False), nullable=False, index=True)

    assigned_to: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    resolution_notes: Mapped[str | None] = mapped_column(String(2048), nullable=True)

    # relationships
    transaction: Mapped["Transaction"] = relationship("Transaction", back_populates="fraud_alerts")
    prediction: Mapped[Optional["Prediction"]] = relationship("Prediction", back_populates="fraud_alert", uselist=False)
    assigned_user: Mapped[Optional["User"]] = relationship("User", back_populates="assigned_alerts")
    investigation_case: Mapped[Optional["InvestigationCase"]] = relationship(
        "InvestigationCase",
        back_populates="fraud_alert",
        uselist=False,
        cascade="all, delete-orphan",
    )
