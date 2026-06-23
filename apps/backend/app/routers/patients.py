from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user
from app.models.consultation import Consultation
from app.models.patient import Patient
from app.schemas.consultation import ConsultationListResponse, ConsultationResponse
from app.schemas.patient import (
    PatientCreate,
    PatientListResponse,
    PatientResponse,
    PatientUpdate,
)
from app.schemas.mesure_vitale import MesureVitaleCreate, MesureVitaleResponse
from app.models.paiement import MesureVitale
from app.services.medecin_scope import (
    get_owned_patient_or_404,
    is_medecin,
    require_medecin,
    scope_consultations_query,
    scope_patients_query,
)
from app.services.patient_delete import delete_patient_cascade

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
        created_at=getattr(patient, "created_at", None),
    )


@router.get("", response_model=PatientListResponse)
async def list_patients(
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    if not is_medecin(current):
        raise HTTPException(status_code=403, detail="Réservé aux médecins")

    base = select(Patient)
    count_query = select(func.count()).select_from(Patient)
    base = scope_patients_query(base, current)
    count_query = scope_patients_query(count_query, current)

    total = await db.scalar(count_query) or 0
    result = await db.execute(base.offset(skip).limit(limit))
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


@router.patch("/me", response_model=PatientResponse)
async def update_mon_profil_patient(
    data: PatientUpdate,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    if current["role"] != "patient":
        raise HTTPException(status_code=403, detail="Réservé aux patients")
    patient = current["user"]
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
    await db.flush()
    await db.refresh(patient)
    return _patient_to_response(patient)


@router.delete("/me", status_code=204)
async def supprimer_mon_compte_patient(
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    if current["role"] != "patient":
        raise HTTPException(status_code=403, detail="Réservé aux patients")

    patient = current["user"]
    await delete_patient_cascade(db, patient)


@router.post("/me/mesures-vitales", response_model=MesureVitaleResponse, status_code=201)
async def enregistrer_mesures_vitales(
    data: MesureVitaleCreate,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    if current["role"] != "patient":
        raise HTTPException(status_code=403, detail="Réservé aux patients")

    mesure = MesureVitale(
        patient_id=current["id"],
        tension_sys=data.tension_sys,
        tension_dia=data.tension_dia,
        spo2=data.spo2,
        temperature=data.temperature,
        frequence_cardiaque=data.frequence_cardiaque,
        source=data.source,
    )
    db.add(mesure)
    await db.flush()
    await db.refresh(mesure)
    return MesureVitaleResponse.model_validate(mesure)


@router.get("/me/consultations", response_model=ConsultationListResponse)
async def get_mes_consultations(
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    if current["role"] != "patient":
        raise HTTPException(status_code=403, detail="Réservé aux patients")

    count_query = scope_consultations_query(
        select(func.count()).select_from(Consultation), current
    )
    total = await db.scalar(count_query) or 0

    query = scope_consultations_query(select(Consultation), current)
    result = await db.execute(
        query.order_by(
            Consultation.programmee_le.desc().nullslast(),
            Consultation.debut_le.desc().nullslast(),
        )
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
    patient = await get_owned_patient_or_404(patient_id, db, current)
    return _patient_to_response(patient)


@router.patch("/{patient_id}", response_model=PatientResponse)
async def update_patient(
    patient_id: str,
    data: PatientUpdate,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    patient = await get_owned_patient_or_404(patient_id, db, current)

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
    patient = await get_owned_patient_or_404(patient_id, db, current)
    await delete_patient_cascade(db, patient)


@router.post("", response_model=PatientResponse, status_code=201)
async def create_patient(
    data: PatientCreate,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    medecin_id = require_medecin(current)

    existing = await db.execute(
        select(Patient).where(Patient.telephone == data.telephone)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Téléphone déjà enregistré")

    patient = Patient(
        medecin_id=medecin_id,
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
