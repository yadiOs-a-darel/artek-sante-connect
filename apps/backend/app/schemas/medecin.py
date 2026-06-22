from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class MedecinProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    telephone: str
    nom: str
    specialite: str
    prefecture: str
    disponible: bool
    est_actif: bool


class MedecinProfileUpdate(BaseModel):
    specialite: str | None = None
    prefecture: str | None = None
    disponible: bool | None = None


class MedecinPinUpdate(BaseModel):
    ancien_pin: str = Field(..., min_length=4, max_length=32)
    nouveau_pin: str = Field(..., min_length=4, max_length=32)
