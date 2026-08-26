from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Annotated, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import TransactionStatus

from app.schemas.prediction import PredictionRead


class TransactionBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    transaction_reference: Annotated[str, Field(...)]
    amount: Annotated[Decimal, Field(...)]
    currency: Annotated[str, Field(...)]
    merchant: Optional[Annotated[str, Field(default=None)]] = None
    merchant_category: Optional[Annotated[str, Field(default=None)]] = None
    customer_id: Optional[Annotated[UUID, Field(default=None)]] = None
    transaction_type: Optional[Annotated[str, Field(default=None)]] = None
    transaction_timestamp: Annotated[datetime, Field(...)]
    location: Optional[Annotated[str, Field(default=None)]] = None
    payment_method: Optional[Annotated[str, Field(default=None)]] = None
    status: Annotated[TransactionStatus, Field(...)]


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    transaction_reference: Optional[Annotated[str, Field(default=None)]] = None
    amount: Optional[Annotated[Decimal, Field(default=None)]] = None
    currency: Optional[Annotated[str, Field(default=None)]] = None
    merchant: Optional[Annotated[str, Field(default=None)]] = None
    merchant_category: Optional[Annotated[str, Field(default=None)]] = None
    customer_id: Optional[Annotated[UUID, Field(default=None)]] = None
    transaction_type: Optional[Annotated[str, Field(default=None)]] = None
    transaction_timestamp: Optional[Annotated[datetime, Field(default=None)]] = None
    location: Optional[Annotated[str, Field(default=None)]] = None
    payment_method: Optional[Annotated[str, Field(default=None)]] = None
    status: Optional[Annotated[TransactionStatus, Field(default=None)]] = None


class TransactionRead(TransactionBase):
    id: Annotated[UUID, Field(...)]
    created_at: Annotated[datetime, Field(...)]
    updated_at: Annotated[datetime, Field(...)] = Field(...)
    prediction: Optional[Annotated["PredictionRead", Field(default=None)]] = None


class TransactionWorkspaceItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Annotated[UUID, Field(...)]
    transaction_reference: Annotated[str, Field(...)]
    amount: Annotated[Decimal, Field(...)]
    currency: Annotated[str, Field(...)]
    merchant: Optional[Annotated[str, Field(default=None)]] = None
    merchant_category: Optional[Annotated[str, Field(default=None)]] = None
    customer_id: Optional[Annotated[UUID, Field(default=None)]] = None
    customer_name: Optional[Annotated[str, Field(default=None)]] = None
    transaction_type: Optional[Annotated[str, Field(default=None)]] = None
    transaction_timestamp: Annotated[datetime, Field(...)]
    location: Optional[Annotated[str, Field(default=None)]] = None
    payment_method: Optional[Annotated[str, Field(default=None)]] = None
    status: Annotated[TransactionStatus, Field(...)]
    risk_score: Optional[Annotated[int, Field(default=None)]] = None
    decision: Optional[Annotated[str, Field(default=None)]] = None


class TransactionWorkspaceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    items: Annotated[list[TransactionWorkspaceItem], Field(default_factory=list)]
    total: Annotated[int, Field(default=0)]


TransactionResponse = TransactionRead
