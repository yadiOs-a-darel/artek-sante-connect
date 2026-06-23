from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.chat_message import ChatMessage, SenderRole
from app.models.consultation import Consultation


async def get_consultation_or_404(
    consultation_id: str, db: AsyncSession
) -> Consultation:
    result = await db.execute(
        select(Consultation).where(Consultation.id == consultation_id)
    )
    consultation = result.scalar_one_or_none()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation introuvable")
    return consultation


def assert_consultation_access(consultation: Consultation, current: dict) -> None:
    if current["role"] == "medecin":
        medecin_id = str(current["id"])
        if not consultation.medecin_id or str(consultation.medecin_id) != medecin_id:
            raise HTTPException(status_code=403, detail="Accès refusé")
        return

    if current["role"] == "patient":
        if str(consultation.patient_id) != str(current["id"]):
            raise HTTPException(status_code=403, detail="Accès refusé")
        return

    raise HTTPException(status_code=403, detail="Rôle non autorisé")


def resolve_sender(current: dict) -> tuple[str, SenderRole]:
    role = current["role"]
    user = current["user"]

    if role == "medecin":
        name = getattr(user, "nom_chiffre", None) or "Médecin"
        return name, SenderRole.medecin

    if role == "patient":
        phone = getattr(user, "telephone", "") or ""
        return f"Patient {phone[-4:]}" if phone else "Patient", SenderRole.patient

    raise HTTPException(status_code=403, detail="Rôle non autorisé")


async def create_chat_message(
    consultation: Consultation,
    db: AsyncSession,
    current: dict,
    contenu: str,
) -> ChatMessage:
    sender_name, sender_role = resolve_sender(current)
    message = ChatMessage(
        consultation_id=consultation.id,
        sender_id=current["id"],
        sender_role=sender_role,
        sender_name=sender_name,
        contenu=contenu.strip(),
    )
    db.add(message)
    await db.flush()
    await db.refresh(message)
    return message
