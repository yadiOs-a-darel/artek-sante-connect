from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.constants.phone import ORANGE_RCA_PHONE_PATTERN
from app.database import get_db
from app.models.paiement import Kiosque
from app.models.patient import Patient
from app.schemas.consultation import ConsultationResponse
from app.services.consultation_serializer import consultation_to_response
from app.services.kiosque_consultation import create_consultation_from_kiosk

router = APIRouter(prefix="/kiosques")


class KiosqueMesuresInput(BaseModel):
    tension_sys: Optional[float] = Field(None, ge=50, le=250)
    tension_dia: Optional[float] = Field(None, ge=30, le=150)
    spo2: Optional[float] = Field(None, ge=50, le=100)
    temperature: Optional[float] = Field(None, ge=34, le=42)


class KiosqueConsultationStart(BaseModel):
    telephone: str = Field(..., pattern=ORANGE_RCA_PHONE_PATTERN)
    motif: str = Field(..., min_length=2, max_length=2000)
    kiosque_id: str = "kiosk-bangui-01"
    mesures: Optional[KiosqueMesuresInput] = None


@router.get("")
async def list_kiosques(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Kiosque))
    kiosques = result.scalars().all()
    return [
        {
            "id": k.id,
            "prefecture": k.prefecture,
            "village": k.village,
            "statut": k.statut,
            "batterie_pct": k.batterie_pct,
            "connexion_ok": bool(k.connexion_ok),
            "latitude": k.latitude,
            "longitude": k.longitude,
        }
        for k in kiosques
    ]


@router.post("/start-consultation", response_model=ConsultationResponse, status_code=201)
async def start_consultation_from_kiosque(
    data: KiosqueConsultationStart,
    db: AsyncSession = Depends(get_db),
):
    """Création de consultation depuis un kiosque ASC (sans JWT patient)."""
    if settings.APP_ENV not in ("development", "test") and not settings.DEBUG:
        raise HTTPException(
            status_code=403,
            detail="Endpoint réservé au développement — configurer l'auth kiosque en production",
        )

    kiosk_result = await db.execute(select(Kiosque).where(Kiosque.id == data.kiosque_id))
    kiosk = kiosk_result.scalar_one_or_none()
    if not kiosk:
        raise HTTPException(status_code=404, detail="Kiosque introuvable")

    patient_result = await db.execute(
        select(Patient).where(Patient.telephone == data.telephone)
    )
    patient = patient_result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non enregistré")

    mesures = data.mesures.model_dump(exclude_none=True) if data.mesures else None
    consultation = await create_consultation_from_kiosk(
        db,
        kiosk=kiosk,
        patient=patient,
        motif=data.motif,
        mesures=mesures,
    )
    return consultation_to_response(consultation, patient)
