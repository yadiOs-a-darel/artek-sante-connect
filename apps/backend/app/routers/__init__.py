from fastapi import APIRouter

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

__all__ = [
    "auth",
    "dashboard",
    "patients",
    "medecins",
    "consultations",
    "ordonnances",
    "paiements",
    "ia",
    "kiosques",
    "pharmacies",
    "rapports",
    "websocket",
]
