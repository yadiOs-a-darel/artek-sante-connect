from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.medecin import Medecin
from app.models.patient import Patient
from app.schemas.auth import (
    LoginMedecinRequest,
    LoginPatientRequest,
    OtpRequest,
    OtpResponse,
    RefreshTokenRequest,
    TokenResponse,
    UserInfo,
)
from app.security.jwt import (
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_pin,
)
from app.services.otp import generate_otp, verify_otp
from app.deps import get_current_user

router = APIRouter(prefix="/auth")


@router.post("/login/medecin", response_model=TokenResponse)
async def login_medecin(
    data: LoginMedecinRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Medecin).where(Medecin.telephone == data.telephone)
    )
    medecin = result.scalar_one_or_none()

    if not medecin or not medecin.pin_hash or not verify_pin(data.pin, medecin.pin_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Téléphone ou PIN incorrect",
        )

    access = create_access_token(str(medecin.id), "medecin")
    refresh = create_refresh_token(str(medecin.id), "medecin")
    return TokenResponse(access_token=access, refresh_token=refresh, expires_in=28800)


@router.post("/otp/request", response_model=OtpResponse)
async def request_otp(
    data: OtpRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Patient).where(Patient.telephone == data.telephone)
    )
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Numéro non enregistré. Contactez un centre de santé ARTEK.",
        )

    otp = generate_otp(data.telephone)
    response = OtpResponse(message="Code envoyé par SMS Orange")
    from app.config import settings

    if settings.DEBUG or settings.APP_ENV == "development":
        response.dev_otp = otp
    return response


@router.post("/login/patient", response_model=TokenResponse)
async def login_patient(
    data: LoginPatientRequest,
    db: AsyncSession = Depends(get_db),
):
    if not verify_otp(data.telephone, data.otp):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Code OTP invalide ou expiré",
        )

    result = await db.execute(
        select(Patient).where(Patient.telephone == data.telephone)
    )
    patient = result.scalar_one_or_none()
    if not patient or not patient.est_actif:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Patient introuvable ou inactif",
        )

    access = create_access_token(str(patient.id), "patient")
    refresh = create_refresh_token(str(patient.id), "patient")
    return TokenResponse(access_token=access, refresh_token=refresh, expires_in=86400)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(data: RefreshTokenRequest):
    try:
        payload = decode_token(data.refresh_token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Refresh token invalide")

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Type de token invalide")

    access = create_access_token(payload["sub"], payload["role"])
    refresh = create_refresh_token(payload["sub"], payload["role"])
    return TokenResponse(access_token=access, refresh_token=refresh, expires_in=28800)


@router.get("/me", response_model=UserInfo)
async def get_me(current=Depends(get_current_user)):
    user = current["user"]
    return UserInfo(
        id=current["id"],
        role=current["role"],
        telephone=user.telephone,
    )


@router.post("/logout")
async def logout():
    return {"message": "Déconnexion réussie"}
