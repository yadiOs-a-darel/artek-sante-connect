from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class LoginMedecinRequest(BaseModel):
    telephone: str = Field(..., pattern=r"^7\d{7}$")
    pin: str = Field(..., min_length=4, max_length=32)


class LoginPatientRequest(BaseModel):
    telephone: str = Field(..., pattern=r"^7\d{7}$")
    otp: str = Field(..., min_length=4, max_length=6)


class OtpRequest(BaseModel):
    telephone: str = Field(..., pattern=r"^7\d{7}$")


class OtpResponse(BaseModel):
    message: str
    dev_otp: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UserInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    role: str
    telephone: str
