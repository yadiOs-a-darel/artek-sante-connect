from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.integrations.google_meet import GoogleMeetError, google_meet_client
from app.models.consultation import Consultation, StatutConsultation


def _extract_meet_code(url: str) -> str:
    if "meet.google.com/" in url:
        return url.rstrip("/").split("/")[-1]
    return ""


async def prepare_video_session(
    consultation: Consultation,
    db: AsyncSession,
    *,
    user_name: str,
    is_owner: bool = True,
) -> dict:
    del user_name, is_owner  # réservé pour invitations Calendar futures

    if consultation.salle_video_url:
        meet_url = consultation.salle_video_url
        return {
            "configured": True,
            "room_url": meet_url,
            "room_name": _extract_meet_code(meet_url),
            "token": "",
            "domain": "meet.google.com",
            "message": None,
        }

    try:
        title = f"Consultation ARTEK — {consultation.motif or 'Téléconsultation'}"
        meet_url = google_meet_client.create_meeting(title, str(consultation.id))
    except GoogleMeetError as exc:
        configured = bool(
            google_meet_client.is_configured or settings.GOOGLE_MEET_DEV_URL
        )
        return {
            "configured": configured,
            "room_url": "",
            "room_name": "",
            "token": "",
            "domain": "meet.google.com",
            "message": str(exc),
        }

    consultation.salle_video_url = meet_url
    consultation.salle_video_token = None

    if consultation.statut == StatutConsultation.en_attente:
        consultation.statut = StatutConsultation.en_cours
        consultation.debut_le = datetime.utcnow()

    await db.flush()

    return {
        "configured": True,
        "room_url": meet_url,
        "room_name": _extract_meet_code(meet_url),
        "token": "",
        "domain": "meet.google.com",
        "message": None,
    }
