import uuid
from typing import Annotated, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.medecin import Medecin
from app.models.patient import Patient
from app.security.jwt import decode_token

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Annotated[Optional[HTTPAuthorizationCredentials], Depends(security)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentification requise",
        )

    try:
        payload = decode_token(credentials.credentials)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide",
        )

    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Type de token invalide",
        )

    user_id = uuid.UUID(payload.get("sub"))
    role = payload.get("role")

    if role == "medecin":
        result = await db.execute(select(Medecin).where(Medecin.id == user_id))
        user = result.scalar_one_or_none()
    elif role == "patient":
        result = await db.execute(select(Patient).where(Patient.id == user_id))
        user = result.scalar_one_or_none()
    else:
        raise HTTPException(status_code=401, detail="Rôle inconnu")

    if not user:
        raise HTTPException(status_code=401, detail="Utilisateur introuvable")

    return {"user": user, "role": role, "id": user_id}
