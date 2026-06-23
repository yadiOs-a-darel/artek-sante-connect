import enum
import uuid

from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class StatutPaiement(str, enum.Enum):
    en_attente = "en_attente"
    confirme = "confirme"
    echoue = "echoue"
    rembourse = "rembourse"


class Paiement(Base):
    __tablename__ = "paiements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"))
    consultation_id = Column(UUID(as_uuid=True), ForeignKey("consultations.id"))
    montant = Column(Integer, nullable=False)
    reference = Column(String(100), unique=True, nullable=False)
    statut = Column(Enum(StatutPaiement), default=StatutPaiement.en_attente)
    token_orange = Column(String(255))
    telephone = Column(String(20))

    patient = relationship("Patient", back_populates="paiements")


class MesureVitale(Base):
    __tablename__ = "mesures_vitales"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"))
    consultation_id = Column(UUID(as_uuid=True), ForeignKey("consultations.id"), nullable=True)
    tension_sys = Column(Float)
    tension_dia = Column(Float)
    spo2 = Column(Float)
    temperature = Column(Float)
    frequence_cardiaque = Column(Integer)
    source = Column(String(50), default="mobile")
    mesure_le = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="mesures_vitales")


class Kiosque(Base):
    __tablename__ = "kiosques"

    id = Column(String(50), primary_key=True)
    prefecture = Column(String(50), nullable=False)
    village = Column(String(100))
    statut = Column(String(20), default="actif")
    batterie_pct = Column(Integer, default=100)
    connexion_ok = Column(Integer, default=1)
    latitude = Column(Float)
    longitude = Column(Float)
