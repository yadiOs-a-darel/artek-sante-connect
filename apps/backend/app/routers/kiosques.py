from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.consultation import Consultation, StatutConsultation, TypeConsultation
from app.models.paiement import Kiosque
from app.models.patient import Patient
from app.schemas.consultation import ConsultationResponse

router = APIRouter(prefix="/kiosques")


class KiosqueConsultationStart(BaseModel):
    telephone: str = Field(..., pattern=r"^7\d{7}$")
    motif: str
    kiosque_id: str = "kiosk-bangui-01"


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


@router.post("/start-consultation", response_model=ConsultationResponse)
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

    kiosk = await db.execute(select(Kiosque).where(Kiosque.id == data.kiosque_id))
    if not kiosk.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Kiosque introuvable")

    patient_result = await db.execute(
        select(Patient).where(Patient.telephone == data.telephone)
    )
    patient = patient_result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non enregistré")

    consultation = Consultation(
        patient_id=patient.id,
        motif=data.motif,
        type_consultation=TypeConsultation.video,
        statut=StatutConsultation.en_attente,
    )
    db.add(consultation)
    await db.flush()
    await db.refresh(consultation)
    return ConsultationResponse.model_validate(consultation)
