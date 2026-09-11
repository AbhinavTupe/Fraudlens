from __future__ import annotations

import os
import pickle
from functools import lru_cache
from typing import Optional

from sqlalchemy.orm import Session

from app.config import get_settings
from app.crud.ml_model import MLModelRepository
from app.ml.shap_explainer import CANONICAL_ARTIFACT_PATH
from app.models import MLModel


class MLModelNotAvailableError(Exception):
    pass


class MLModelService:
    def __init__(self, ml_model_repo: Optional[MLModelRepository] = None) -> None:
        self.ml_model_repo = ml_model_repo or MLModelRepository()
        self.settings = get_settings()

    @lru_cache(maxsize=1)
    def get_cached_model(self):
        model_path = CANONICAL_ARTIFACT_PATH
        if not os.path.exists(model_path):
            raise MLModelNotAvailableError(f"Model path {model_path} is not available")
        with open(model_path, "rb") as handle:
            return pickle.load(handle)

    def get_active_model(self, db: Session) -> MLModel:
        model = self.ml_model_repo.get_active_model(db)
        if model is None:
            raise MLModelNotAvailableError("No active ML model is configured")
        return model

    def get_model_for_inference(self, db: Session):
        model_meta = self.get_active_model(db)
        model_obj = self.get_cached_model()
        return model_meta, model_obj
