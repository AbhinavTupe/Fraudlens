from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class MLFeatureRecordCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    transaction_id: UUID
    source_dataset: str = Field(min_length=1)
    source_transaction_id: int
    feature_contract_version: str = Field(min_length=1)
    feature_version: str = Field(min_length=1)
    transaction_amt: Decimal
    product_cd: str = Field(min_length=1, max_length=1)
    c1: Decimal
    c2: Decimal
    c3: Decimal
    c4: Decimal
    c5: Decimal
    c6: Decimal
    c7: Decimal
    c8: Decimal
    c9: Decimal
    c10: Decimal
    c11: Decimal
    c12: Decimal
    c13: Decimal
    c14: Decimal


class MLFeatureRecordRead(MLFeatureRecordCreate):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
