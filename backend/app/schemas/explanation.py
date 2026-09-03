from __future__ import annotations

from typing import Annotated, Any
from uuid import UUID

from pydantic import BaseModel, Field


class ExplanationContribution(BaseModel):
    feature: Annotated[str, Field(...)]
    value: Any
    contribution: Annotated[float, Field(...)]
    reason: Annotated[str, Field(...)]


class TransactionExplanation(BaseModel):
    transaction_id: Annotated[UUID, Field(...)]
    model_version: Annotated[str | None, Field(default=None)] = None
    threshold: Annotated[float, Field(...)]
    raw_score: Annotated[float, Field(...)]
    fraud_probability: Annotated[float, Field(...)]
    decision: Annotated[str, Field(...)]
    contributions: list[ExplanationContribution] = Field(default_factory=list)
