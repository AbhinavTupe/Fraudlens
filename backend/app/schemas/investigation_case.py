from __future__ import annotations

from datetime import datetime
from typing import Annotated, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import CaseStatus, Priority

from app.schemas.evidence import EvidenceRead
from app.schemas.case_comment import CaseCommentRead


class InvestigationCaseBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    fraud_alert_id: Annotated[UUID, Field(...)]
    case_number: Optional[Annotated[str, Field(default=None)]] = None
    title: Optional[Annotated[str, Field(default=None)]] = None
    description: Optional[Annotated[str, Field(default=None)]] = None
    status: Annotated[CaseStatus, Field(...)]
    priority: Annotated[Priority, Field(...)]
    assigned_to: Optional[Annotated[UUID, Field(default=None)]] = None
    opened_at: Optional[Annotated[datetime, Field(default=None)]] = None
    closed_at: Optional[Annotated[datetime, Field(default=None)]] = None
    resolution: Optional[Annotated[str, Field(default=None)]] = None


class InvestigationCaseCreate(InvestigationCaseBase):
    pass


class InvestigationCaseUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    case_number: Optional[Annotated[str, Field(default=None)]] = None
    title: Optional[Annotated[str, Field(default=None)]] = None
    description: Optional[Annotated[str, Field(default=None)]] = None
    status: Optional[Annotated[CaseStatus, Field(default=None)]] = None
    priority: Optional[Annotated[Priority, Field(default=None)]] = None
    assigned_to: Optional[Annotated[UUID, Field(default=None)]] = None
    opened_at: Optional[Annotated[datetime, Field(default=None)]] = None
    closed_at: Optional[Annotated[datetime, Field(default=None)]] = None
    resolution: Optional[Annotated[str, Field(default=None)]] = None


class InvestigationCaseRead(InvestigationCaseBase):
    id: Annotated[UUID, Field(...)]
    created_at: Annotated[datetime, Field(...)]
    updated_at: Annotated[datetime, Field(...)]
    evidences: Optional[Annotated[List["EvidenceRead"], Field(default=None)]] = None
    comments: Optional[Annotated[List["CaseCommentRead"], Field(default=None)]] = None

InvestigationCaseResponse = InvestigationCaseRead
