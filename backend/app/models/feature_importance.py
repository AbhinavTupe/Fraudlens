from __future__ import annotations

from sqlalchemy import Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
import uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import BaseModelMixin


class FeatureImportance(Base, BaseModelMixin):
    __tablename__ = "feature_importances"

    model_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("ml_models.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    feature_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    importance: Mapped[float] = mapped_column(Float, nullable=False)
    rank: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)

    model: Mapped["MLModel"] = relationship("MLModel", back_populates="feature_importances")
