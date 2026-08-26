from __future__ import annotations

from datetime import datetime
from typing import Annotated, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import UserRole, UserStatus


class UserBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    full_name: Annotated[str, Field(...)]
    email: Annotated[str, Field(...)]
    role: Annotated[UserRole, Field(...)]
    status: Annotated[UserStatus, Field(...)]


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    full_name: Optional[Annotated[str, Field(default=None)]] = None
    email: Optional[Annotated[str, Field(default=None)]] = None
    role: Optional[Annotated[UserRole, Field(default=None)]] = None
    status: Optional[Annotated[UserStatus, Field(default=None)]] = None
    last_login: Optional[Annotated[datetime, Field(default=None)]] = None


class UserRead(UserBase):
    id: Annotated[UUID, Field(...)]
    created_at: Annotated[datetime, Field(...)]
    updated_at: Annotated[datetime, Field(...)]
    last_login: Optional[Annotated[datetime, Field(default=None)]] = None


UserResponse = UserRead
