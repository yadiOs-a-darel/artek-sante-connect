from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user
from app.models.consultation import Consultation, StatutConsultation, TypeConsultation
from app.schemas.consultation import (
    ConsultationCreate,
    ConsultationListResponse,
    ConsultationResponse,
    ConsultationUpdate,
    VideoSessionResponse,
)
from app.services.video_call import prepare_video_session

router = APIRouter(prefix="/consultations")


@router.get("", response_model=ConsultationListResponse)
async def list_consultations(
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
    statut: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    query = select(Consultation).order_by(Consultation.debut_le.desc().nullslast())
    count_query = select(func.count()).select_from(Consultation)

    if statut:
        try:
            statut_enum = StatutConsultation(statut)
            query = query.where(Consultation.statut == statut_enum)
            count_query = count_query.where(Consultation.statut == statut_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail="Statut invalide")

    total = await db.scalar(count_query) or 0
    result = await db.execute(query.offset(skip).limit(limit))
    items = result.scalars().all()

    return ConsultationListResponse(
        items=[ConsultationResponse.model_validate(c) for c in items],
        total=total,
    )


@router.get("/{consultation_id}", response_model=ConsultationResponse)
async def get_consultation(
    consultation_id: str,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    result = await db.execute(
        select(Consultation).where(Consultation.id == consultation_id)
    )
    consultation = result.scalar_one_or_none()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation introuvable")
    return ConsultationResponse.model_validate(consultation)


@router.post("", response_model=ConsultationResponse, status_code=201)
async def create_consultation(
    data: ConsultationCreate,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    type_consultation = TypeConsultation.video
    if data.type_consultation:
        try:
            type_consultation = TypeConsultation(data.type_consultation)
        except ValueError:
            raise HTTPException(status_code=400, detail="Type de consultation invalide")

    medecin_id = data.medecin_id
    if current["role"] == "medecin" and not medecin_id:
        medecin_id = current["id"]

    consultation = Consultation(
        patient_id=data.patient_id,
        medecin_id=medecin_id,
        motif=data.motif,
        type_consultation=type_consultation,
        statut=StatutConsultation.en_attente,
    )
    db.add(consultation)
    await db.flush()
    await db.refresh(consultation)
    return ConsultationResponse.model_validate(consultation)


@router.get("/{consultation_id}/video", response_model=VideoSessionResponse)
async def get_video_session(
    consultation_id: str,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    result = await db.execute(
        select(Consultation).where(Consultation.id == consultation_id)
    )
    consultation = result.scalar_one_or_none()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation introuvable")

    role = current["role"]
    user = current["user"]

    if role == "medecin":
        user_name = getattr(user, "nom_chiffre", None) or "Médecin"
        is_owner = True
    elif role == "patient":
        user_name = f"Patient {getattr(user, 'telephone', '')[-4:]}"
        is_owner = False
        if str(consultation.patient_id) != str(current["id"]):
            raise HTTPException(status_code=403, detail="Accès refusé")
    else:
        raise HTTPException(status_code=403, detail="Rôle non autorisé")

    session = await prepare_video_session(
        consultation,
        db,
        user_name=user_name,
        is_owner=is_owner,
    )
    return VideoSessionResponse(**session)


@router.patch("/{consultation_id}/demarrer", response_model=ConsultationResponse)
async def demarrer_consultation(
    consultation_id: str,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    from datetime import datetime

    result = await db.execute(
        select(Consultation).where(Consultation.id == consultation_id)
    )
    consultation = result.scalar_one_or_none()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation introuvable")

    consultation.statut = StatutConsultation.en_cours
    consultation.debut_le = datetime.utcnow()
    await db.flush()
    await db.refresh(consultation)
    return ConsultationResponse.model_validate(consultation)


@router.patch("/{consultation_id}", response_model=ConsultationResponse)
async def update_consultation(
    consultation_id: str,
    data: ConsultationUpdate,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    result = await db.execute(
        select(Consultation).where(Consultation.id == consultation_id)
    )
    consultation = result.scalar_one_or_none()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation introuvable")

    if data.motif is not None:
        consultation.motif = data.motif
    if data.diagnostic is not None:
        consultation.diagnostic = data.diagnostic
    if data.statut is not None:
        try:
            consultation.statut = StatutConsultation(data.statut)
        except ValueError:
            raise HTTPException(status_code=400, detail="Statut invalide")
    if data.type_consultation is not None:
        try:
            consultation.type_consultation = TypeConsultation(data.type_consultation)
        except ValueError:
            raise HTTPException(status_code=400, detail="Type invalide")

    await db.flush()
    await db.refresh(consultation)
    return ConsultationResponse.model_validate(consultation)


@router.delete("/{consultation_id}", status_code=204)
async def delete_consultation(
    consultation_id: str,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    result = await db.execute(
        select(Consultation).where(Consultation.id == consultation_id)
    )
    consultation = result.scalar_one_or_none()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation introuvable")
    await db.delete(consultation)
