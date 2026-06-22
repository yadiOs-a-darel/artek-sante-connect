from datetime import date, datetime

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user
from app.models.consultation import Consultation, StatutConsultation
from app.models.medecin import Medecin
from app.models.ordonnance import Ordonnance
from app.models.paiement import Kiosque
from app.models.patient import Patient
from app.schemas.dashboard import DashboardStats

router = APIRouter(prefix="/dashboard")


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    today_start = datetime.combine(date.today(), datetime.min.time())

    consultations_today = await db.scalar(
        select(func.count())
        .select_from(Consultation)
        .where(Consultation.debut_le >= today_start)
    ) or 0

    patients_actifs = await db.scalar(
        select(func.count()).select_from(Patient).where(Patient.est_actif == True)
    ) or 0

    rendez_vous = await db.scalar(
        select(func.count())
        .select_from(Consultation)
        .where(Consultation.statut == StatutConsultation.en_attente)
    ) or 0

    kiosques_actifs = await db.scalar(
        select(func.count()).select_from(Kiosque).where(Kiosque.statut == "actif")
    ) or 0

    month_start = datetime.combine(date.today().replace(day=1), datetime.min.time())
    ordonnances_mois = await db.scalar(
        select(func.count()).select_from(Ordonnance)
    ) or 0

    return DashboardStats(
        consultations_aujourdhui=consultations_today,
        patients_actifs=patients_actifs,
        rendez_vous_en_attente=rendez_vous,
        kiosques_actifs=kiosques_actifs,
        ordonnances_mois=ordonnances_mois,
    )
