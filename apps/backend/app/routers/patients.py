from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user
from app.models.consultation import Consultation
from app.models.ordonnance import Ordonnance
from app.models.patient import Patient
from app.schemas.consultation import ConsultationListResponse, ConsultationResponse
from app.schemas.patient import (
    PatientCreate,
    PatientListResponse,
    PatientResponse,
    PatientUpdate,
)

router = APIRouter(prefix="/patients")


def _patient_to_response(patient: Patient) -> PatientResponse:
    return PatientResponse(
        id=patient.id,
        telephone=patient.telephone,
        nom=patient.nom_chiffre,
        prenom=patient.prenom_chiffre,
        prefecture=patient.prefecture,
        village=patient.village,
        langue_preferee=patient.langue_preferee,
        est_actif=patient.est_actif,
        created_at=patient.created_at,
    )


@router.get("", response_model=PatientListResponse)
async def list_patients(
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    count_result = await db.execute(select(func.count()).select_from(Patient))
    total = count_result.scalar() or 0

    result = await db.execute(select(Patient).offset(skip).limit(limit))
    patients = result.scalars().all()

    return PatientListResponse(
        items=[_patient_to_response(p) for p in patients],
        total=total,
    )


@router.get("/me", response_model=PatientResponse)
async def get_mon_profil_patient(
    current=Depends(get_current_user),
):
    if current["role"] != "patient":
        raise HTTPException(status_code=403, detail="Réservé aux patients")
    return _patient_to_response(current["user"])


@router.get("/me/consultations", response_model=ConsultationListResponse)
async def get_mes_consultations(
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    if current["role"] != "patient":
        raise HTTPException(status_code=403, detail="Réservé aux patients")

    patient_id = current["id"]
    count_result = await db.execute(
        select(func.count())
        .select_from(Consultation)
        .where(Consultation.patient_id == patient_id)
    )
    total = count_result.scalar() or 0

    result = await db.execute(
        select(Consultation)
        .where(Consultation.patient_id == patient_id)
        .order_by(Consultation.debut_le.desc().nullslast())
        .offset(skip)
        .limit(limit)
    )
    items = result.scalars().all()
    return ConsultationListResponse(
        items=[ConsultationResponse.model_validate(c) for c in items],
        total=total,
    )


@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: str,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient introuvable")
    return _patient_to_response(patient)


@router.patch("/{patient_id}", response_model=PatientResponse)
async def update_patient(
    patient_id: str,
    data: PatientUpdate,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient introuvable")

    if data.nom is not None:
        patient.nom_chiffre = data.nom
    if data.prenom is not None:
        patient.prenom_chiffre = data.prenom
    if data.prefecture is not None:
        patient.prefecture = data.prefecture
    if data.village is not None:
        patient.village = data.village
    if data.langue_preferee is not None:
        patient.langue_preferee = data.langue_preferee
    if data.est_actif is not None:
        patient.est_actif = data.est_actif

    await db.flush()
    await db.refresh(patient)
    return _patient_to_response(patient)


@router.delete("/{patient_id}", status_code=204)
async def delete_patient(
    patient_id: str,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient introuvable")

    consultations = (
        await db.execute(select(Consultation).where(Consultation.patient_id == patient_id))
    ).scalars().all()
    for c in consultations:
        await db.delete(c)

    ordonnances = (
        await db.execute(select(Ordonnance).where(Ordonnance.patient_id == patient_id))
    ).scalars().all()
    for o in ordonnances:
        await db.delete(o)

    await db.delete(patient)


@router.post("", response_model=PatientResponse, status_code=201)
async def create_patient(data: PatientCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(
        select(Patient).where(Patient.telephone == data.telephone)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Téléphone déjà enregistré")

    patient = Patient(
        telephone=data.telephone,
        nom_chiffre=data.nom,
        prenom_chiffre=data.prenom,
        prefecture=data.prefecture,
        village=data.village,
        langue_preferee=data.langue_preferee,
        consentement=data.consentement,
    )
    db.add(patient)
    await db.flush()
    await db.refresh(patient)
    return _patient_to_response(patient)
