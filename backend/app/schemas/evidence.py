from __future__ import annotations

from datetime import datetime
from typing import Annotated, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class EvidenceBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    case_id: Annotated[UUID, Field(...)]
    filename: Annotated[str, Field(...)]
    file_type: Optional[Annotated[str, Field(default=None)]] = None
    uploaded_by: Optional[Annotated[UUID, Field(default=None)]] = None
    file_size: Optional[Annotated[int, Field(default=None)]] = None
    uploaded_at: Optional[Annotated[datetime, Field(default=None)]] = None


class EvidenceCreate(EvidenceBase):
    pass


class EvidenceUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    filename: Optional[Annotated[str, Field(default=None)]] = None
    file_type: Optional[Annotated[str, Field(default=None)]] = None
    uploaded_by: Optional[Annotated[UUID, Field(default=None)]] = None
    file_size: Optional[Annotated[int, Field(default=None)]] = None
    uploaded_at: Optional[Annotated[datetime, Field(default=None)]] = None


class EvidenceRead(EvidenceBase):
    id: Annotated[UUID, Field(...)]
    created_at: Annotated[datetime, Field(...)]
    updated_at: Annotated[datetime, Field(...)]


EvidenceResponse = EvidenceRead
