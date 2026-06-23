"""Suppression d'un patient et de toutes ses données liées."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.chat_message import ChatMessage
from app.models.consultation import Consultation
from app.models.ordonnance import DossierMedical, Ordonnance
from app.models.paiement import MesureVitale, Paiement
from app.models.patient import Patient


async def delete_patient_cascade(db: AsyncSession, patient: Patient) -> None:
    patient_id = patient.id

    consultations = (
        await db.execute(select(Consultation).where(Consultation.patient_id == patient_id))
    ).scalars().all()
    consultation_ids = [c.id for c in consultations]

    if consultation_ids:
        messages = (
            await db.execute(
                select(ChatMessage).where(ChatMessage.consultation_id.in_(consultation_ids))
            )
        ).scalars().all()
        for message in messages:
            await db.delete(message)

    for consultation in consultations:
        await db.delete(consultation)

    for mesure in (
        await db.execute(select(MesureVitale).where(MesureVitale.patient_id == patient_id))
    ).scalars().all():
        await db.delete(mesure)

    for ordonnance in (
        await db.execute(select(Ordonnance).where(Ordonnance.patient_id == patient_id))
    ).scalars().all():
        await db.delete(ordonnance)

    dossier = (
        await db.execute(select(DossierMedical).where(DossierMedical.patient_id == patient_id))
    ).scalar_one_or_none()
    if dossier:
        await db.delete(dossier)

    for paiement in (
        await db.execute(select(Paiement).where(Paiement.patient_id == patient_id))
    ).scalars().all():
        await db.delete(paiement)

    await db.delete(patient)
