from __future__ import annotations

from datetime import datetime
from typing import Annotated, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class PredictionBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    transaction_id: Annotated[UUID, Field(...)]
    fraud_probability: Annotated[float, Field(...)]
    predicted_label: Annotated[str, Field(...)]
    model_version: Optional[Annotated[str, Field(default=None)]] = None
    inference_time_ms: Optional[Annotated[int, Field(default=None)]] = None
    threshold_used: Optional[Annotated[float, Field(default=None)]] = None


class PredictionCreate(PredictionBase):
    pass


class PredictionUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    fraud_probability: Optional[Annotated[float, Field(default=None)]] = None
    predicted_label: Optional[Annotated[str, Field(default=None)]] = None
    model_version: Optional[Annotated[str, Field(default=None)]] = None
    inference_time_ms: Optional[Annotated[int, Field(default=None)]] = None
    threshold_used: Optional[Annotated[float, Field(default=None)]] = None


class PredictionRead(PredictionBase):
    id: Annotated[UUID, Field(...)]
    created_at: Annotated[datetime, Field(...)]
    updated_at: Annotated[datetime, Field(...)]


PredictionResponse = PredictionRead
