import random
from datetime import datetime, timedelta

from app.config import settings

_otp_store: dict[str, tuple[str, datetime]] = {}
OTP_TTL_MINUTES = 10
DEV_OTP = "000000"


def generate_otp(telephone: str) -> str:
    if settings.DEBUG or settings.APP_ENV == "development":
        otp = DEV_OTP
    else:
        otp = f"{random.randint(0, 999999):06d}"
    _otp_store[telephone] = (otp, datetime.utcnow() + timedelta(minutes=OTP_TTL_MINUTES))
    return otp


def verify_otp(telephone: str, otp: str) -> bool:
    entry = _otp_store.get(telephone)
    if not entry:
        return (settings.DEBUG or settings.APP_ENV == "development") and otp == DEV_OTP
    stored, expires = entry
    if datetime.utcnow() > expires:
        _otp_store.pop(telephone, None)
        return False
    if stored == otp:
        _otp_store.pop(telephone, None)
        return True
    return False
