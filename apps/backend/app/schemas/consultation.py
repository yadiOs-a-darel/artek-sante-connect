from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class MedecinResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    specialite: str
    prefecture: str
    disponible: bool


class ConsultationCreate(BaseModel):
    patient_id: UUID
    medecin_id: Optional[UUID] = None
    motif: Optional[str] = None
    type_consultation: str = "video"


class ConsultationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    patient_id: UUID
    medecin_id: Optional[UUID] = None
    statut: str
    type_consultation: str
    motif: Optional[str] = None
    salle_video_url: Optional[str] = None
    debut_le: Optional[datetime] = None
    fin_le: Optional[datetime] = None


class ConsultationUpdate(BaseModel):
    motif: Optional[str] = None
    statut: Optional[str] = None
    type_consultation: Optional[str] = None
    diagnostic: Optional[str] = None


class ConsultationListResponse(BaseModel):
    items: list[ConsultationResponse]
    total: int


class VideoSessionResponse(BaseModel):
    configured: bool
    room_url: str
    room_name: str
    token: str
    domain: str
    message: Optional[str] = None
