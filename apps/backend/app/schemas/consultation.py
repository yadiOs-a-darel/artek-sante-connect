from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class MedecinResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    nom: Optional[str] = None
    specialite: str
    prefecture: str
    disponible: bool


class MesuresVitalesInput(BaseModel):
    tension_sys: Optional[float] = Field(None, ge=50, le=250)
    tension_dia: Optional[float] = Field(None, ge=30, le=150)
    spo2: Optional[float] = Field(None, ge=50, le=100)
    temperature: Optional[float] = Field(None, ge=34, le=42)
    frequence_cardiaque: Optional[int] = Field(None, ge=30, le=220)


class ConsultationDemandeCreate(BaseModel):
    medecin_id: UUID
    symptomes: str = Field(..., min_length=3, max_length=2000)
    specialite_souhaitee: Optional[str] = None
    type_consultation: str = "video"
    mesures: Optional[MesuresVitalesInput] = None


class ConsultationReponseMedecin(BaseModel):
    action: str = Field(..., pattern=r"^(accepter|refuser)$")
    reponse_medecin: str = Field(..., min_length=2, max_length=1000)
    programmee_le: Optional[datetime] = None


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
    symptomes: Optional[str] = None
    reponse_medecin: Optional[str] = None
    programmee_le: Optional[datetime] = None
    salle_video_url: Optional[str] = None
    debut_le: Optional[datetime] = None
    fin_le: Optional[datetime] = None
    patient_nom: Optional[str] = None
    patient_prenom: Optional[str] = None
    patient_telephone: Optional[str] = None


class ConsultationUpdate(BaseModel):
    motif: Optional[str] = None
    statut: Optional[str] = None
    type_consultation: Optional[str] = None
    diagnostic: Optional[str] = None
    reponse_medecin: Optional[str] = None
    programmee_le: Optional[datetime] = None


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
