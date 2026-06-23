from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class MesureVitaleCreate(BaseModel):
    tension_sys: Optional[float] = Field(None, ge=50, le=250)
    tension_dia: Optional[float] = Field(None, ge=30, le=150)
    spo2: Optional[float] = Field(None, ge=50, le=100)
    temperature: Optional[float] = Field(None, ge=34, le=42)
    frequence_cardiaque: Optional[int] = Field(None, ge=30, le=220)
    source: str = "mobile"


class MesureVitaleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    patient_id: UUID
    consultation_id: Optional[UUID] = None
    tension_sys: Optional[float] = None
    tension_dia: Optional[float] = None
    spo2: Optional[float] = None
    temperature: Optional[float] = None
    frequence_cardiaque: Optional[int] = None
    source: Optional[str] = None
    mesure_le: Optional[datetime] = None
