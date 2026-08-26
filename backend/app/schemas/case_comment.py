from __future__ import annotations

from datetime import datetime
from typing import Annotated, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class CaseCommentBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    case_id: Annotated[UUID, Field(...)]
    author_id: Optional[Annotated[UUID, Field(default=None)]] = None
    comment: Annotated[str, Field(...)]
    created_at: Optional[Annotated[datetime, Field(default=None)]] = None


class CaseCommentCreate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    case_id: Annotated[UUID, Field(...)]
    author_id: Optional[Annotated[UUID, Field(default=None)]] = None
    comment: Annotated[str, Field(...)]


class CaseCommentUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    author_id: Optional[Annotated[UUID, Field(default=None)]] = None
    comment: Optional[Annotated[str, Field(default=None)]] = None


class CaseCommentRead(CaseCommentBase):
    id: Annotated[UUID, Field(...)]
    created_at: Annotated[datetime, Field(...)]
    updated_at: Annotated[datetime, Field(...)]


CaseCommentResponse = CaseCommentRead
