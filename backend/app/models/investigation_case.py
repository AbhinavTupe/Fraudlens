from __future__ import annotations

from datetime import datetime
import uuid
from typing import List, Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import BaseModelMixin
from app.models.enums import CaseStatus, Priority


class InvestigationCase(Base, BaseModelMixin):
    __tablename__ = "investigation_cases"

    fraud_alert_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("fraud_alerts.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    case_number: Mapped[str | None] = mapped_column(String(64), nullable=True)
    title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str | None] = mapped_column(String(2048), nullable=True)

    status: Mapped[CaseStatus] = mapped_column(
        Enum(CaseStatus, native_enum=False),
        nullable=False,
        index=True,
    )
    priority: Mapped[Priority] = mapped_column(
        Enum(Priority, native_enum=False),
        nullable=False,
        index=True,
    )

    assigned_to: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    opened_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    resolution: Mapped[str | None] = mapped_column(String(2048), nullable=True)

    # relationships
    fraud_alert: Mapped["FraudAlert"] = relationship("FraudAlert", back_populates="investigation_case", uselist=False)
    evidences: Mapped[List["Evidence"]] = relationship("Evidence", back_populates="case", cascade="all, delete-orphan")
    comments: Mapped[List["CaseComment"]] = relationship("CaseComment", back_populates="case", cascade="all, delete-orphan")
    assigned_user: Mapped[Optional["User"]] = relationship("User", back_populates="investigation_cases")


# indexes are declared via index=True on mapped columns to avoid duplicates
