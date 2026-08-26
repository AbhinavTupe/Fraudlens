from __future__ import annotations

from datetime import datetime
from typing import Annotated, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import AlertSeverity, AlertStatus


class FraudAlertBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    transaction_id: Annotated[UUID, Field(...)]
    prediction_id: Optional[Annotated[UUID, Field(default=None)]] = None
    severity: Annotated[AlertSeverity, Field(...)]
    status: Annotated[AlertStatus, Field(...)]
    assigned_to: Optional[Annotated[UUID, Field(default=None)]] = None
    reviewed_at: Optional[Annotated[datetime, Field(default=None)]] = None
    resolution_notes: Optional[Annotated[str, Field(default=None)]] = None


class FraudAlertCreate(FraudAlertBase):
    pass


class FraudAlertUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    prediction_id: Optional[Annotated[UUID, Field(default=None)]] = None
    severity: Optional[Annotated[AlertSeverity, Field(default=None)]] = None
    status: Optional[Annotated[AlertStatus, Field(default=None)]] = None
    assigned_to: Optional[Annotated[UUID, Field(default=None)]] = None
    reviewed_at: Optional[Annotated[datetime, Field(default=None)]] = None
    resolution_notes: Optional[Annotated[str, Field(default=None)]] = None


class FraudAlertRead(FraudAlertBase):
    id: Annotated[UUID, Field(...)]
    created_at: Annotated[datetime, Field(...)]
    updated_at: Annotated[datetime, Field(...)] = Field(...)
    investigation_case: Optional["InvestigationCaseRead"] = None


FraudAlertResponse = FraudAlertRead

# Ensure the forward reference name exists in this module's globals so pydantic can resolve it
try:
    from app.schemas.investigation_case import InvestigationCaseRead  # noqa: F401
except Exception:
    # import may fail during partial imports; model_rebuild will be attempted at runtime
    pass
