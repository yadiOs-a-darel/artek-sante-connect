from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.constants.phone import ORANGE_RCA_PHONE_PATTERN


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class LoginMedecinRequest(BaseModel):
    telephone: str = Field(..., pattern=ORANGE_RCA_PHONE_PATTERN)
    pin: str = Field(..., min_length=4, max_length=32)


class RegisterMedecinRequest(BaseModel):
    nom: str = Field(..., min_length=2, max_length=120)
    telephone: str = Field(..., pattern=ORANGE_RCA_PHONE_PATTERN)
    pin: str = Field(..., min_length=4, max_length=32)
    pin_confirm: str = Field(..., min_length=4, max_length=32)
    specialite: str = Field(..., min_length=2, max_length=100)
    prefecture: str = Field(..., min_length=2, max_length=50)

    @model_validator(mode="after")
    def pins_match(self):
        if self.pin != self.pin_confirm:
            raise ValueError("Les codes PIN ne correspondent pas")
        return self


class RegisterPatientRequest(BaseModel):
    telephone: str = Field(..., pattern=ORANGE_RCA_PHONE_PATTERN)
    otp: str = Field(..., min_length=4, max_length=6)
    nom: str = Field(..., min_length=2, max_length=120)
    prenom: str = Field(..., min_length=2, max_length=120)
    prefecture: str = Field(..., min_length=2, max_length=50)
    village: Optional[str] = Field(None, max_length=100)
    langue_preferee: str = Field(default="fr", max_length=10)
    consentement: bool = True

    @model_validator(mode="after")
    def consent_required(self):
        if not self.consentement:
            raise ValueError("Le consentement est obligatoire")
        return self


class LoginPatientRequest(BaseModel):
    telephone: str = Field(..., pattern=ORANGE_RCA_PHONE_PATTERN)
    otp: str = Field(..., min_length=4, max_length=6)


class OtpRequest(BaseModel):
    telephone: str = Field(..., pattern=ORANGE_RCA_PHONE_PATTERN)
    inscription: bool = False


class OtpResponse(BaseModel):
    message: str
    dev_otp: Optional[str] = None
    compte_existe: bool = False


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UserInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    role: str
    telephone: str
