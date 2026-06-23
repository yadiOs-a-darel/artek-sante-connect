"""Filtrage et contrôle d'accès par médecin connecté."""

from fastapi import HTTPException
from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.consultation import Consultation
from app.models.ordonnance import Ordonnance
from app.models.patient import Patient


def require_medecin(current: dict) -> str:
    if current["role"] != "medecin":
        raise HTTPException(status_code=403, detail="Réservé aux médecins")
    return str(current["id"])


def is_medecin(current: dict) -> bool:
    return current["role"] == "medecin"


def medecin_id_or_none(current: dict) -> str | None:
    if is_medecin(current):
        return str(current["id"])
    return None


def assert_patient_owned(patient: Patient, current: dict) -> None:
    if current["role"] == "patient":
        if str(patient.id) != str(current["id"]):
            raise HTTPException(status_code=404, detail="Patient introuvable")
        return
    if is_medecin(current):
        medecin_id = str(current["id"])
        if not patient.medecin_id or str(patient.medecin_id) != medecin_id:
            raise HTTPException(status_code=404, detail="Patient introuvable")


def assert_consultation_owned(consultation: Consultation, current: dict) -> None:
    if current["role"] == "patient":
        if str(consultation.patient_id) != str(current["id"]):
            raise HTTPException(status_code=403, detail="Accès refusé")
        return

    if current["role"] == "medecin":
        medecin_id = str(current["id"])
        if not consultation.medecin_id or str(consultation.medecin_id) != medecin_id:
            raise HTTPException(status_code=403, detail="Accès refusé")
        return

    raise HTTPException(status_code=403, detail="Rôle non autorisé")


async def get_owned_patient_or_404(
    patient_id: str, db: AsyncSession, current: dict
) -> Patient:
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient introuvable")
    assert_patient_owned(patient, current)
    return patient


async def get_owned_consultation_or_404(
    consultation_id: str, db: AsyncSession, current: dict
) -> Consultation:
    result = await db.execute(
        select(Consultation).where(Consultation.id == consultation_id)
    )
    consultation = result.scalar_one_or_none()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation introuvable")
    assert_consultation_owned(consultation, current)
    return consultation


def scope_patients_query(query: Select, current: dict) -> Select:
    if is_medecin(current):
        return query.where(Patient.medecin_id == current["id"])
    return query


def scope_consultations_query(query: Select, current: dict) -> Select:
    if is_medecin(current):
        return query.where(Consultation.medecin_id == current["id"])
    if current["role"] == "patient":
        return query.where(Consultation.patient_id == current["id"])
    return query


def scope_ordonnances_query(query: Select, current: dict) -> Select:
    if is_medecin(current):
        return query.where(Ordonnance.medecin_id == current["id"])
    if current["role"] == "patient":
        return query.where(Ordonnance.patient_id == current["id"])
    return query
