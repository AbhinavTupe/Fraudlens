from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.base import Base
from app.models.base import UUIDMixin, BaseModelMixin


class CaseComment(Base, UUIDMixin):
    __tablename__ = "case_comments"

    case_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("investigation_cases.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    author_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    comment: Mapped[str] = mapped_column(String(4096), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)

    # relationships
    case: Mapped["InvestigationCase"] = relationship("InvestigationCase", back_populates="comments")
    author: Mapped[Optional["User"]] = relationship("User", back_populates="case_comments")
