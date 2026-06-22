from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class PatientCreate(BaseModel):
    telephone: str = Field(..., pattern=r"^7\d{7}$")
    nom: str
    prenom: str
    prefecture: str
    village: Optional[str] = None
    langue_preferee: str = "fr"
    consentement: bool = True


class PatientUpdate(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    prefecture: Optional[str] = None
    village: Optional[str] = None
    langue_preferee: Optional[str] = None
    est_actif: Optional[bool] = None


class PatientResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    telephone: str
    nom: Optional[str] = None
    prenom: Optional[str] = None
    prefecture: str
    village: Optional[str] = None
    langue_preferee: str
    est_actif: bool
    created_at: Optional[datetime] = None


class PatientListResponse(BaseModel):
    items: list[PatientResponse]
    total: int
