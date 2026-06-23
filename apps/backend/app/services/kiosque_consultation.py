"""Création de consultations depuis un kiosque ASC."""

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.consultation import Consultation, StatutConsultation, TypeConsultation
from app.models.medecin import Medecin
from app.models.paiement import Kiosque, MesureVitale
from app.models.patient import Patient


async def resolve_medecin_for_kiosk(
    db: AsyncSession,
    kiosk: Kiosque,
    patient: Patient,
) -> Medecin:
    if patient.medecin_id:
        result = await db.execute(
            select(Medecin).where(
                Medecin.id == patient.medecin_id,
                Medecin.est_actif == True,
            )
        )
        medecin = result.scalar_one_or_none()
        if medecin:
            return medecin

    for prefecture in (kiosk.prefecture, patient.prefecture):
        result = await db.execute(
            select(Medecin)
            .where(Medecin.est_actif == True, Medecin.prefecture == prefecture)
            .order_by(Medecin.disponible.desc())
            .limit(1)
        )
        medecin = result.scalar_one_or_none()
        if medecin:
            return medecin

    result = await db.execute(
        select(Medecin)
        .where(Medecin.est_actif == True)
        .order_by(Medecin.disponible.desc())
        .limit(1)
    )
    medecin = result.scalar_one_or_none()
    if not medecin:
        raise HTTPException(
            status_code=503,
            detail="Aucun médecin disponible pour prendre en charge cette demande kiosque",
        )
    return medecin


async def create_consultation_from_kiosk(
    db: AsyncSession,
    *,
    kiosk: Kiosque,
    patient: Patient,
    motif: str,
    mesures: dict | None = None,
) -> Consultation:
    medecin = await resolve_medecin_for_kiosk(db, kiosk, patient)

    if not patient.medecin_id:
        patient.medecin_id = medecin.id

    symptomes = motif if motif.startswith("[Kiosque]") else f"[Kiosque] {motif}"

    consultation = Consultation(
        patient_id=patient.id,
        medecin_id=medecin.id,
        motif=symptomes[:500],
        symptomes=symptomes,
        type_consultation=TypeConsultation.video,
        statut=StatutConsultation.en_attente_validation,
    )
    db.add(consultation)
    await db.flush()

    if mesures:
        mesure = MesureVitale(
            patient_id=patient.id,
            consultation_id=consultation.id,
            tension_sys=mesures.get("tension_sys"),
            tension_dia=mesures.get("tension_dia"),
            spo2=mesures.get("spo2"),
            temperature=mesures.get("temperature"),
            source="kiosque",
        )
        db.add(mesure)

    await db.flush()
    await db.refresh(consultation)
    return consultation
