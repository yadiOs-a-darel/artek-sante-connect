import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.config import settings
from app.database import Base, engine
from app.routers import (
    auth,
    consultations,
    dashboard,
    ia,
    kiosques,
    medecins,
    ordonnances,
    paiements,
    patients,
    pharmacies,
    rapports,
    websocket,
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.db_ready = False
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        app.state.db_ready = True
        logger.info("PostgreSQL connecté — tables initialisées")
    except Exception as exc:
        if settings.DEBUG or settings.APP_ENV == "development":
            logger.warning(
                "PostgreSQL indisponible (%s). L'API démarre sans base de données. "
                "Corrigez DATABASE_URL dans .env ou créez l'utilisateur artek.",
                exc,
            )
        else:
            raise
    yield
    await engine.dispose()


app = FastAPI(
    title="ARTEK Connect Santé API",
    description="API de télémédecine solaire pour la République Centrafricaine",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Instrumentator().instrument(app).expose(app, endpoint="/metrics")

app.include_router(auth.router, prefix="/api/v1", tags=["Authentification"])
app.include_router(dashboard.router, prefix="/api/v1", tags=["Dashboard"])
app.include_router(patients.router, prefix="/api/v1", tags=["Patients"])
app.include_router(medecins.router, prefix="/api/v1", tags=["Médecins"])
app.include_router(consultations.router, prefix="/api/v1", tags=["Consultations"])
app.include_router(ordonnances.router, prefix="/api/v1", tags=["Ordonnances"])
app.include_router(paiements.router, prefix="/api/v1", tags=["Paiements Orange"])
app.include_router(ia.router, prefix="/api/v1", tags=["IA Diagnostic"])
app.include_router(kiosques.router, prefix="/api/v1", tags=["Kiosques IoT"])
app.include_router(pharmacies.router, prefix="/api/v1", tags=["Pharmacies"])
app.include_router(rapports.router, prefix="/api/v1", tags=["Rapports"])
app.include_router(websocket.router, prefix="/api/v1", tags=["WebSocket"])


@app.get("/health")
async def health_check():
    db_ready = getattr(app.state, "db_ready", False)
    return {
        "status": "ok" if db_ready else "degraded",
        "service": "artek-connect-sante",
        "version": "1.0.0",
        "database": "connected" if db_ready else "disconnected",
    }
