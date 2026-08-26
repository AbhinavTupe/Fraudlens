from __future__ import annotations

from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.base import BaseRepository
from app.models import TrainingJob


class TrainingJobRepository(BaseRepository[TrainingJob]):
    def __init__(self) -> None:
        super().__init__(TrainingJob)

    def get_latest_job(self, db: Session, model_id) -> TrainingJob | None:
        stmt = select(TrainingJob).where(TrainingJob.model_id == model_id).order_by(TrainingJob.started_at.desc()).limit(1)
        return db.scalars(stmt).one_or_none()

    def get_running_jobs(self, db: Session, limit: int = 100) -> List[TrainingJob]:
        stmt = select(TrainingJob).where(TrainingJob.status == "running").limit(limit)
        return list(db.scalars(stmt).all())
