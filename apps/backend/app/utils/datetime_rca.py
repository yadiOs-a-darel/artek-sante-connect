"""Fuseau horaire RCA (Bangui, UTC+1) pour les rendez-vous."""

from datetime import datetime, timezone
from zoneinfo import ZoneInfo

RCA_TZ = ZoneInfo("Africa/Bangui")


def utc_now_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def to_utc_naive(dt: datetime) -> datetime:
    """Interprète un datetime naïf comme heure locale RCA, puis convertit en UTC naïf."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=RCA_TZ)
    return dt.astimezone(timezone.utc).replace(tzinfo=None)


def to_rca_naive(dt: datetime) -> datetime:
    """Normalise pour stockage : heure « mur » en RCA, sans tzinfo."""
    if dt.tzinfo is not None:
        return dt.astimezone(RCA_TZ).replace(tzinfo=None)
    return dt


def assert_future_programmation(dt: datetime) -> None:
    from fastapi import HTTPException

    if to_utc_naive(dt) <= utc_now_naive():
        raise HTTPException(
            status_code=400,
            detail="La date et l'heure du rendez-vous doivent être dans le futur",
        )
