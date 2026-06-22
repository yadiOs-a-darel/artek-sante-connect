import enum

from sqlalchemy import Boolean, Column, DateTime, Enum, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.database import Base


class Genre(str, enum.Enum):
    masculin = "masculin"
    feminin = "feminin"
    autre = "autre"


class Patient(Base):
    __tablename__ = "patients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    telephone = Column(String(20), unique=True, nullable=False, index=True)
    nom_chiffre = Column(Text, nullable=False)
    prenom_chiffre = Column(Text, nullable=False)
    date_naissance_chiffre = Column(Text)
    genre = Column(Enum(Genre))
    nni = Column(String(20), unique=True)
    prefecture = Column(String(50), nullable=False)
    village = Column(String(100))
    langue_preferee = Column(String(10), default="fr")
    est_femme_enceinte = Column(Boolean, default=False)
    consentement = Column(Boolean, nullable=False, default=False)
    est_actif = Column(Boolean, default=True)
    abonnement_famille_actif = Column(Boolean, default=False)
    abonnement_expire_le = Column(DateTime)

    consultations = relationship("Consultation", back_populates="patient")
    dossier_medical = relationship("DossierMedical", back_populates="patient", uselist=False)
    mesures_vitales = relationship("MesureVitale", back_populates="patient")
    paiements = relationship("Paiement", back_populates="patient")
