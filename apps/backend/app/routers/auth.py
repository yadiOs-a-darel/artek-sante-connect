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
    RegisterMedecinRequest,
    RegisterPatientRequest,
    TokenResponse,
    UserInfo,
)
from app.security.jwt import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_pin,
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


@router.post("/register/medecin", response_model=TokenResponse, status_code=201)
async def register_medecin(
    data: RegisterMedecinRequest,
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(
        select(Medecin).where(Medecin.telephone == data.telephone)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ce numéro de téléphone est déjà enregistré",
        )

    medecin = Medecin(
        telephone=data.telephone,
        nom_chiffre=data.nom.strip(),
        specialite=data.specialite.strip(),
        prefecture=data.prefecture.strip(),
        pin_hash=hash_pin(data.pin),
        disponible=True,
        est_actif=True,
    )
    db.add(medecin)
    await db.flush()
    await db.refresh(medecin)

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

    if not patient and not data.inscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Numéro non enregistré. Créez un compte patient pour continuer.",
        )

    otp = generate_otp(data.telephone)
    response = OtpResponse(
        message="Code envoyé par SMS Orange",
        compte_existe=patient is not None,
    )
    from app.config import settings

    if settings.DEBUG or settings.APP_ENV == "development":
        response.dev_otp = otp
    return response


@router.post("/register/patient", response_model=TokenResponse, status_code=201)
async def register_patient(
    data: RegisterPatientRequest,
    db: AsyncSession = Depends(get_db),
):
    if not verify_otp(data.telephone, data.otp):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Code OTP invalide ou expiré",
        )

    existing = await db.execute(
        select(Patient).where(Patient.telephone == data.telephone)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ce numéro est déjà enregistré. Connectez-vous.",
        )

    patient = Patient(
        telephone=data.telephone,
        nom_chiffre=data.nom.strip(),
        prenom_chiffre=data.prenom.strip(),
        prefecture=data.prefecture.strip(),
        village=data.village.strip() if data.village else None,
        langue_preferee=data.langue_preferee,
        consentement=data.consentement,
        est_actif=True,
    )
    db.add(patient)
    await db.flush()
    await db.refresh(patient)

    access = create_access_token(str(patient.id), "patient")
    refresh = create_refresh_token(str(patient.id), "patient")
    return TokenResponse(access_token=access, refresh_token=refresh, expires_in=86400)


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
