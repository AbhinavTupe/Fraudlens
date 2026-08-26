from __future__ import annotations

from datetime import datetime
from typing import Annotated, Dict, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import TrainingJobStatus


class TrainingJobBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    model_id: Annotated[UUID, Field(...)]
    started_at: Optional[Annotated[datetime, Field(default=None)]] = None
    completed_at: Optional[Annotated[datetime, Field(default=None)]] = None
    status: Annotated[TrainingJobStatus, Field(...)]
    parameters_json: Optional[Annotated[Dict[str, object], Field(default=None)]] = None
    metrics_json: Optional[Annotated[Dict[str, object], Field(default=None)]] = None
    epoch_count: Optional[Annotated[int, Field(default=None)]] = None
    training_accuracy: Optional[Annotated[float, Field(default=None)]] = None
    validation_accuracy: Optional[Annotated[float, Field(default=None)]] = None
    training_loss: Optional[Annotated[float, Field(default=None)]] = None
    validation_loss: Optional[Annotated[float, Field(default=None)]] = None
    # artifact_path and logs_path intentionally omitted from schemas to avoid exposing internal paths


class TrainingJobCreate(TrainingJobBase):
    pass


class TrainingJobUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    started_at: Optional[Annotated[datetime, Field(default=None)]] = None
    completed_at: Optional[Annotated[datetime, Field(default=None)]] = None
    status: Optional[Annotated[TrainingJobStatus, Field(default=None)]] = None
    parameters_json: Optional[Annotated[Dict[str, object], Field(default=None)]] = None
    metrics_json: Optional[Annotated[Dict[str, object], Field(default=None)]] = None
    epoch_count: Optional[Annotated[int, Field(default=None)]] = None
    training_accuracy: Optional[Annotated[float, Field(default=None)]] = None
    validation_accuracy: Optional[Annotated[float, Field(default=None)]] = None
    training_loss: Optional[Annotated[float, Field(default=None)]] = None
    validation_loss: Optional[Annotated[float, Field(default=None)]] = None
    # artifact_path and logs_path intentionally omitted from update schema to avoid exposing internal paths


class TrainingJobRead(TrainingJobBase):
    id: Annotated[UUID, Field(...)]
    created_at: Annotated[datetime, Field(...)]
    updated_at: Annotated[datetime, Field(...)] = Field(...)


TrainingJobResponse = TrainingJobRead
