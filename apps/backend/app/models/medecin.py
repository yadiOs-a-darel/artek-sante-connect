import uuid

from sqlalchemy import Boolean, Column, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class Medecin(Base):
    __tablename__ = "medecins"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    telephone = Column(String(20), unique=True, nullable=False, index=True)
    nom_chiffre = Column(Text, nullable=False)
    specialite = Column(String(100), nullable=False)
    prefecture = Column(String(50), nullable=False)
    pin_hash = Column(String(255))
    disponible = Column(Boolean, default=True)
    est_actif = Column(Boolean, default=True)
