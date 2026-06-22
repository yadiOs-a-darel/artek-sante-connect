import enum
import uuid

from sqlalchemy import Column, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class TypeConsultation(str, enum.Enum):
    video = "video"
    audio = "audio"
    differe = "differe"
    chat = "chat"


class StatutConsultation(str, enum.Enum):
    en_attente = "en_attente"
    en_cours = "en_cours"
    terminee = "terminee"
    annulee = "annulee"


class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    medecin_id = Column(UUID(as_uuid=True), ForeignKey("medecins.id"))
    type_consultation = Column(Enum(TypeConsultation), default=TypeConsultation.video)
    statut = Column(Enum(StatutConsultation), default=StatutConsultation.en_attente)
    motif = Column(Text)
    diagnostic = Column(Text)
    salle_video_url = Column(String(500))
    salle_video_token = Column(String(500))
    debut_le = Column(DateTime)
    fin_le = Column(DateTime)

    patient = relationship("Patient", back_populates="consultations")
    medecin = relationship("Medecin")
