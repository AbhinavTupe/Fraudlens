from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import BaseModelMixin
from app.models.enums import UserRole, UserStatus


class User(Base, BaseModelMixin):
    __tablename__ = "users"

    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole, native_enum=False), nullable=False)
    status: Mapped[UserStatus] = mapped_column(Enum(UserStatus, native_enum=False), nullable=False)
    last_login: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    setting: Mapped[Optional["Setting"]] = relationship(
        "Setting",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    activity_logs: Mapped[list["ActivityLog"]] = relationship(
        "ActivityLog",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    from typing import List

    transactions: Mapped[List["Transaction"]] = relationship(
        "Transaction",
        back_populates="user",
        passive_deletes=True,
    )

    assigned_alerts: Mapped[List["FraudAlert"]] = relationship(
        "FraudAlert",
        back_populates="assigned_user",
    )

    investigation_cases: Mapped[List["InvestigationCase"]] = relationship(
        "InvestigationCase",
        back_populates="assigned_user",
    )

    evidences: Mapped[List["Evidence"]] = relationship(
        "Evidence",
        back_populates="uploader",
    )

    case_comments: Mapped[List["CaseComment"]] = relationship(
        "CaseComment",
        back_populates="author",
    )
