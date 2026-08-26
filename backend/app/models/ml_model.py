from __future__ import annotations

from typing import List

from sqlalchemy import Boolean, Enum, Float, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import BaseModelMixin


class MLModel(Base, BaseModelMixin):
    __tablename__ = "ml_models"
    __table_args__ = (
        UniqueConstraint("name", "version", name="uq_ml_models_name_version"),
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    version: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    algorithm: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    artifact_path: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    metrics_path: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    training_dataset: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, index=True)
    accuracy: Mapped[float | None] = mapped_column(Float, nullable=True)
    precision: Mapped[float | None] = mapped_column(Float, nullable=True)
    recall: Mapped[float | None] = mapped_column(Float, nullable=True)
    f1_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    roc_auc: Mapped[float | None] = mapped_column(Float, nullable=True)

    training_jobs: Mapped[List["TrainingJob"]] = relationship(
        "TrainingJob",
        back_populates="model",
        cascade="all, delete-orphan",
    )
    feature_importances: Mapped[List["FeatureImportance"]] = relationship(
        "FeatureImportance",
        back_populates="model",
        cascade="all, delete-orphan",
    )
