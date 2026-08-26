from __future__ import annotations

from datetime import datetime
import uuid

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, JSON, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import BaseModelMixin
from app.models.enums import TrainingJobStatus


class TrainingJob(Base, BaseModelMixin):
    __tablename__ = "training_jobs"

    model_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("ml_models.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[TrainingJobStatus] = mapped_column(
        Enum(TrainingJobStatus, native_enum=False),
        nullable=False,
        default=TrainingJobStatus.QUEUED,
        index=True,
    )
    parameters_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    metrics_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    epoch_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    training_accuracy: Mapped[float | None] = mapped_column(Float, nullable=True)
    validation_accuracy: Mapped[float | None] = mapped_column(Float, nullable=True)
    training_loss: Mapped[float | None] = mapped_column(Float, nullable=True)
    validation_loss: Mapped[float | None] = mapped_column(Float, nullable=True)
    artifact_path: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    logs_path: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    hyperparameters: Mapped[str | None] = mapped_column(String(2048), nullable=True)

    model: Mapped["MLModel"] = relationship("MLModel", back_populates="training_jobs")
