from __future__ import annotations

from typing import Annotated, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class SettingBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    theme: Annotated[str, Field(...)]
    notification_preferences: Annotated[str, Field(...)]
    dashboard_preferences: Annotated[str, Field(...)]


class SettingCreate(SettingBase):
    user_id: Annotated[UUID, Field(...)]


class SettingUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    theme: Optional[Annotated[str, Field(default=None)]] = None
    notification_preferences: Optional[Annotated[str, Field(default=None)]] = None
    dashboard_preferences: Optional[Annotated[str, Field(default=None)]] = None


from datetime import datetime

class SettingRead(SettingBase):
    id: Annotated[UUID, Field(...)]
    user_id: Annotated[UUID, Field(...)]
    created_at: Annotated[datetime, Field(...)]
    updated_at: Annotated[datetime, Field(...)]


SettingResponse = SettingRead
