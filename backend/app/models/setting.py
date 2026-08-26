from __future__ import annotations

import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import BaseModelMixin


class Setting(Base, BaseModelMixin):
    __tablename__ = "settings"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    theme: Mapped[str] = mapped_column(String(50), nullable=False, default="light")
    notification_preferences: Mapped[str] = mapped_column(String(1024), nullable=False, default="{}")
    dashboard_preferences: Mapped[str] = mapped_column(String(2048), nullable=False, default="{}")

    user: Mapped["User"] = relationship("User", back_populates="setting")
