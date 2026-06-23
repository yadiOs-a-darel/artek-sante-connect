import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class SenderRole(str, enum.Enum):
    medecin = "medecin"
    patient = "patient"


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    consultation_id = Column(
        UUID(as_uuid=True), ForeignKey("consultations.id"), nullable=False, index=True
    )
    sender_id = Column(UUID(as_uuid=True), nullable=False)
    sender_role = Column(Enum(SenderRole), nullable=False)
    sender_name = Column(String(120), nullable=False)
    contenu = Column(Text, nullable=False)
    envoye_le = Column(DateTime, default=datetime.utcnow, nullable=False)
