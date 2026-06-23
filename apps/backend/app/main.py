import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.config import settings
from app.database import Base, engine
from app.migrations import run_light_migrations
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
            await run_light_migrations(conn)
        app.state.db_ready = True
        logger.info("PostgreSQL connecté — tables initialisées")
        if (
            not settings.GOOGLE_MEET_DEV_URL.strip()
            and settings.GOOGLE_SERVICE_ACCOUNT_JSON.strip() in ("", "{}")
        ):
            logger.warning(
                "GOOGLE_MEET_DEV_URL non configuré — définissez un lien Meet dans .env "
                "(ex. GOOGLE_MEET_DEV_URL=https://meet.google.com/abc-defg-hij) puis redémarrez."
            )
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

cors_kwargs: dict = {
    "allow_credentials": True,
    "allow_methods": ["*"],
    "allow_headers": ["*"],
    "allow_origins": settings.ALLOWED_ORIGINS,
}

# En dev : autoriser localhost + IP LAN (ex. http://192.168.1.99:3000)
if settings.DEBUG or settings.APP_ENV == "development":
    cors_kwargs["allow_origin_regex"] = (
        r"https?://(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?"
    )

app.add_middleware(CORSMiddleware, **cors_kwargs)

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
