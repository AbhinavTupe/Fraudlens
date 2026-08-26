from __future__ import annotations

from datetime import datetime
from typing import Annotated, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ActivityLogBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: Annotated[UUID, Field(...)]
    action: Annotated[str, Field(...)]
    resource: Annotated[str, Field(...)]
    details: Optional[Annotated[str, Field(default=None)]] = None
    ip_address: Optional[Annotated[str, Field(default=None)]] = None
    user_agent: Optional[Annotated[str, Field(default=None)]] = None


class ActivityLogCreate(ActivityLogBase):
    pass


class ActivityLogUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    action: Optional[Annotated[str, Field(default=None)]] = None
    resource: Optional[Annotated[str, Field(default=None)]] = None
    details: Optional[Annotated[str, Field(default=None)]] = None
    ip_address: Optional[Annotated[str, Field(default=None)]] = None
    user_agent: Optional[Annotated[str, Field(default=None)]] = None


class ActivityLogRead(ActivityLogBase):
    id: Annotated[UUID, Field(...)]
    created_at: Annotated[datetime, Field(...)]
    updated_at: Annotated[datetime, Field(...)]


ActivityLogResponse = ActivityLogRead
