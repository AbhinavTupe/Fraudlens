from __future__ import annotations

from datetime import datetime
from typing import Annotated, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class FeatureImportanceBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    model_id: Annotated[UUID, Field(...)]
    feature_name: Annotated[str, Field(...)]
    importance: Annotated[float, Field(...)]
    rank: Optional[Annotated[int, Field(default=None)]] = None


class FeatureImportanceCreate(FeatureImportanceBase):
    pass


class FeatureImportanceUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    feature_name: Optional[Annotated[str, Field(default=None)]] = None
    importance: Optional[Annotated[float, Field(default=None)]] = None
    rank: Optional[Annotated[int, Field(default=None)]] = None


from datetime import datetime

class FeatureImportanceRead(FeatureImportanceBase):
    id: Annotated[UUID, Field(...)]
    created_at: Annotated[datetime, Field(...)]
    updated_at: Annotated[datetime, Field(...)] = Field(...)


FeatureImportanceResponse = FeatureImportanceRead
