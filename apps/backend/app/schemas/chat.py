from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ChatMessageCreate(BaseModel):
    contenu: str = Field(..., min_length=1, max_length=4000)


class ChatMessageResponse(BaseModel):
    id: UUID
    consultation_id: UUID
    sender_role: str
    sender_name: str
    contenu: str
    envoye_le: datetime

    model_config = {"from_attributes": True}
