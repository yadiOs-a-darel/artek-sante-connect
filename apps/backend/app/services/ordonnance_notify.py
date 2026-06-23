"""Notification SMS ordonnance (stub dev + hook Orange)."""

import logging

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


async def send_ordonnance_sms(telephone: str, qr_code: str) -> bool:
    """Envoie un SMS au patient avec le code ordonnance. Retourne True si envoyé."""
    message = (
        f"ARTEK Santé — Votre ordonnance est prête. "
        f"Code pharmacie : {qr_code}. Présentez-le en officine."
    )
    token = settings.ORANGE_SMS_TOKEN.strip()
    if not token or token == "dev_sms_token":
        logger.info("SMS ordonnance (dev) +236 %s : %s", telephone, message)
        return False

    url = settings.ORANGE_SMS_URL
    sender = settings.ORANGE_SMS_SENDER
    payload = {
        "outboundSMSMessageRequest": {
            "address": f"tel:+236{telephone}",
            "senderAddress": f"tel:+236{sender}",
            "outboundSMSTextMessage": {"message": message},
        }
    }
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(
                url,
                json=payload,
                headers={"Authorization": f"Bearer {token}"},
            )
            response.raise_for_status()
        return True
    except Exception as exc:
        logger.warning("Échec SMS ordonnance pour %s : %s", telephone, exc)
        return False
