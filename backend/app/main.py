import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers.auth import router as auth_router
from app.api.routers.dashboard import router as dashboard_router
from app.api.routers.evidence import router as evidence_router
from app.api.routers.fraud_alerts import router as fraud_alerts_router
from app.api.routers.investigations import router as investigations_router
from app.api.routers.ml_models import router as ml_models_router
from app.api.routers.transactions import router as transactions_router
from app.api.routers.users import router as users_router
from app.config import get_settings
from app.core.logging import configure_logging

configure_logging()
logger = logging.getLogger(__name__)

settings = get_settings()

app = FastAPI(
    title="FraudLens API",
    version="1.0.0",
    description="Fraud detection and decision intelligence platform",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_origin_regex=r"https?://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(transactions_router, prefix="/api")
app.include_router(fraud_alerts_router, prefix="/api")
app.include_router(investigations_router, prefix="/api")
app.include_router(evidence_router, prefix="/api")
app.include_router(ml_models_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")


@app.on_event("startup")
async def on_startup() -> None:
    logger.info("FraudLens API starting on %s:%s", settings.BACKEND_HOST, settings.BACKEND_PORT)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "healthy"}
