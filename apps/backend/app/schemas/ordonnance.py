from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class MedicamentItem(BaseModel):
    nom: str
    dosage: str
    frequence: str
    duree: str


class OrdonnanceCreate(BaseModel):
    consultation_id: Optional[UUID] = None
    patient_id: UUID
    medicaments: list[MedicamentItem] = Field(..., min_length=1)
    instructions: Optional[str] = None


class OrdonnanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    consultation_id: Optional[UUID] = None
    patient_id: UUID
    medecin_id: Optional[UUID] = None
    medicaments: list[Any]
    qr_code: Optional[str] = None
    pdf_url: Optional[str] = None


class OrdonnanceUpdate(BaseModel):
    medicaments: Optional[list[MedicamentItem]] = None
    instructions: Optional[str] = None


class OrdonnanceVerifyResponse(BaseModel):
    valide: bool
    qr_code: str
    medecin_nom: Optional[str] = None
    patient_initiales: Optional[str] = None
    medicaments: list[Any]
    instructions: Optional[str] = None
    message: Optional[str] = None


class OrdonnanceListResponse(BaseModel):
    items: list[OrdonnanceResponse]
    total: int
