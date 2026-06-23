from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user
from app.models.consultation import Consultation, StatutConsultation
from app.models.ordonnance import Ordonnance
from app.models.paiement import Kiosque
from app.models.patient import Patient
from app.schemas.dashboard import DashboardStats
from app.services.medecin_scope import is_medecin, scope_consultations_query

router = APIRouter(prefix="/dashboard")


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    if not is_medecin(current):
        raise HTTPException(status_code=403, detail="Réservé aux médecins")

    medecin_id = current["id"]
    today_start = datetime.combine(date.today(), datetime.min.time())

    consultations_today_q = scope_consultations_query(
        select(func.count()).select_from(Consultation), current
    ).where(Consultation.debut_le >= today_start)
    consultations_today = await db.scalar(consultations_today_q) or 0

    patients_actifs = await db.scalar(
        select(func.count())
        .select_from(Patient)
        .where(Patient.medecin_id == medecin_id, Patient.est_actif == True)
    ) or 0

    rendez_vous_q = scope_consultations_query(
        select(func.count()).select_from(Consultation), current
    ).where(
        Consultation.statut.in_(
            [
                StatutConsultation.en_attente,
                StatutConsultation.en_attente_validation,
                StatutConsultation.programmee,
            ]
        )
    )
    rendez_vous = await db.scalar(rendez_vous_q) or 0

    kiosques_actifs = await db.scalar(
        select(func.count()).select_from(Kiosque).where(Kiosque.statut == "actif")
    ) or 0

    ordonnances_mois = await db.scalar(
        select(func.count())
        .select_from(Ordonnance)
        .where(Ordonnance.medecin_id == medecin_id)
    ) or 0

    return DashboardStats(
        consultations_aujourdhui=consultations_today,
        patients_actifs=patients_actifs,
        rendez_vous_en_attente=rendez_vous,
        kiosques_actifs=kiosques_actifs,
        ordonnances_mois=ordonnances_mois,
    )
