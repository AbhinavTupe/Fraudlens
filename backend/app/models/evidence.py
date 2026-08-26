from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.base import Base
from app.models.base import UUIDMixin, BaseModelMixin


class Evidence(Base, UUIDMixin):
    __tablename__ = "evidences"

    case_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("investigation_cases.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    file_type: Mapped[str | None] = mapped_column(String(50), nullable=True)

    uploaded_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    file_size: Mapped[int | None] = mapped_column(Integer, nullable=True)

    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    # relationships
    case: Mapped["InvestigationCase"] = relationship("InvestigationCase", back_populates="evidences")
    uploader: Mapped[Optional["User"]] = relationship("User", back_populates="evidences")
