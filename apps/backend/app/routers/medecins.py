from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user
from app.models.medecin import Medecin
from app.schemas.consultation import MedecinResponse
from app.schemas.medecin import (
    MedecinPinUpdate,
    MedecinProfileResponse,
    MedecinProfileUpdate,
)
from app.security.jwt import hash_pin, verify_pin

router = APIRouter(prefix="/medecins")


@router.get("/disponibles", response_model=list[MedecinResponse])
async def list_medecins_disponibles(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Medecin).where(Medecin.disponible == True, Medecin.est_actif == True)
    )
    medecins = result.scalars().all()
    return [MedecinResponse.model_validate(m) for m in medecins]


@router.get("/me", response_model=MedecinProfileResponse)
async def get_mon_profil(
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    if current["role"] != "medecin":
        raise HTTPException(status_code=403, detail="Réservé aux médecins")

    medecin: Medecin = current["user"]
    return MedecinProfileResponse(
        id=medecin.id,
        telephone=medecin.telephone,
        nom=medecin.nom_chiffre,
        specialite=medecin.specialite,
        prefecture=medecin.prefecture,
        disponible=medecin.disponible,
        est_actif=medecin.est_actif,
    )


@router.patch("/me", response_model=MedecinProfileResponse)
async def update_mon_profil(
    data: MedecinProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    if current["role"] != "medecin":
        raise HTTPException(status_code=403, detail="Réservé aux médecins")

    medecin: Medecin = current["user"]
    if data.specialite is not None:
        medecin.specialite = data.specialite
    if data.prefecture is not None:
        medecin.prefecture = data.prefecture
    if data.disponible is not None:
        medecin.disponible = data.disponible

    await db.flush()
    await db.refresh(medecin)

    return MedecinProfileResponse(
        id=medecin.id,
        telephone=medecin.telephone,
        nom=medecin.nom_chiffre,
        specialite=medecin.specialite,
        prefecture=medecin.prefecture,
        disponible=medecin.disponible,
        est_actif=medecin.est_actif,
    )


@router.post("/me/pin")
async def changer_pin(
    data: MedecinPinUpdate,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    if current["role"] != "medecin":
        raise HTTPException(status_code=403, detail="Réservé aux médecins")

    medecin: Medecin = current["user"]
    if not medecin.pin_hash or not verify_pin(data.ancien_pin, medecin.pin_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ancien PIN incorrect",
        )

    medecin.pin_hash = hash_pin(data.nouveau_pin)
    await db.flush()
    return {"message": "PIN mis à jour avec succès"}
