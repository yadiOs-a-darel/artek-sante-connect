import uuid

from sqlalchemy import Column, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import relationship

from app.database import Base


class DossierMedical(Base):
    __tablename__ = "dossiers_medicaux"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), unique=True)
    antecedents_chiffre = Column(Text)
    allergies_chiffre = Column(Text)
    vaccins = Column(JSON, default=list)
    groupe_sanguin = Column(String(5))

    patient = relationship("Patient", back_populates="dossier_medical")


class Ordonnance(Base):
    __tablename__ = "ordonnances"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    consultation_id = Column(UUID(as_uuid=True), ForeignKey("consultations.id"))
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"))
    medecin_id = Column(UUID(as_uuid=True), ForeignKey("medecins.id"))
    medicaments = Column(JSON, nullable=False)
    qr_code = Column(String(100), unique=True)
    pdf_url = Column(String(500))
