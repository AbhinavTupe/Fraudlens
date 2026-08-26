from __future__ import annotations

from datetime import datetime
from typing import Annotated, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.training_job import TrainingJobRead
from app.schemas.feature_importance import FeatureImportanceRead


class MLModelBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: Annotated[str, Field(...)]
    version: Annotated[str, Field(...)]
    algorithm: Annotated[str, Field(...)]
    description: Optional[Annotated[str, Field(default=None)]] = None
    # artifact_path intentionally omitted from schemas to avoid exposing internal storage paths
    metrics_path: Optional[Annotated[str, Field(default=None)]] = None
    training_dataset: Optional[Annotated[str, Field(default=None)]] = None
    is_active: Annotated[bool, Field(...)]
    accuracy: Optional[Annotated[float, Field(default=None)]] = None
    precision: Optional[Annotated[float, Field(default=None)]] = None
    recall: Optional[Annotated[float, Field(default=None)]] = None
    f1_score: Optional[Annotated[float, Field(default=None)]] = None
    roc_auc: Optional[Annotated[float, Field(default=None)]] = None


class MLModelCreate(MLModelBase):
    pass


class MLModelUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: Optional[Annotated[str, Field(default=None)]] = None
    version: Optional[Annotated[str, Field(default=None)]] = None
    algorithm: Optional[Annotated[str, Field(default=None)]] = None
    description: Optional[Annotated[str, Field(default=None)]] = None
    metrics_path: Optional[Annotated[str, Field(default=None)]] = None
    training_dataset: Optional[Annotated[str, Field(default=None)]] = None
    is_active: Optional[Annotated[bool, Field(default=None)]] = None
    accuracy: Optional[Annotated[float, Field(default=None)]] = None
    precision: Optional[Annotated[float, Field(default=None)]] = None
    recall: Optional[Annotated[float, Field(default=None)]] = None
    f1_score: Optional[Annotated[float, Field(default=None)]] = None
    roc_auc: Optional[Annotated[float, Field(default=None)]] = None


from datetime import datetime

class MLModelRead(MLModelBase):
    id: Annotated[UUID, Field(...)]
    created_at: Annotated[datetime, Field(...)]
    updated_at: Annotated[datetime, Field(...)] = Field(...)
    training_jobs: Optional[Annotated[List[TrainingJobRead], Field(default=None)]] = None
    feature_importances: Optional[Annotated[List[FeatureImportanceRead], Field(default=None)]] = None


MLModelResponse = MLModelRead


MLModelResponse = MLModelRead
