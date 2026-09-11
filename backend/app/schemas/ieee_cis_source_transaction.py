from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class IeeeCisSourceTransactionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    transaction_id: UUID
    source_dataset: str = Field(min_length=1)
    source_transaction_id: int
    transaction_dt: int
    created_at: datetime
    updated_at: datetime
