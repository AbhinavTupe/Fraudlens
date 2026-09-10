from __future__ import annotations

from typing import Annotated
from uuid import UUID

from pydantic import BaseModel, Field


class ExplanationContribution(BaseModel):
    feature_name: Annotated[str, Field(...)]
    feature_value: float
    shap_value: float
    direction: Annotated[str, Field(...)]


class TransactionExplanation(BaseModel):
    transaction_id: Annotated[UUID, Field(...)]
    model_version: Annotated[str, Field(...)]
    contract_version: Annotated[str, Field(...)]
    threshold: Annotated[float, Field(...)]
    fraud_probability: Annotated[float, Field(...)]
    decision: Annotated[str, Field(...)]
    base_value: Annotated[float, Field(...)]
    output_space: Annotated[str, Field(...)]
    contributions: list[ExplanationContribution] = Field(default_factory=list)
