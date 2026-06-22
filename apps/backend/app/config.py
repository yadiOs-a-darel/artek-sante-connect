from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../../.env"),
        case_sensitive=True,
        extra="ignore",
    )

    APP_NAME: str = "ARTEK Connect Santé"
    APP_ENV: str = "development"
    DEBUG: bool = False
    BASE_URL: str = "http://localhost:8000"
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://artek-sante.cf",
    ]

    DATABASE_URL: str = "postgresql+asyncpg://artek:devpassword@localhost:5432/artek_sante"
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_PASSWORD: str = ""

    JWT_SECRET_KEY: str = "dev-secret-change-in-prod-32chars-min"
    JWT_ALGORITHM: str = "HS256"
    JWT_PATIENT_EXPIRE_HOURS: int = 24
    JWT_MEDECIN_EXPIRE_HOURS: int = 8

    MEDICAL_ENCRYPTION_KEY: str = "devkey32byteschangeinproduction!"

    ORANGE_MERCHANT_KEY: str = "dev_merchant_key"
    ORANGE_PAY_SECRET: str = "dev_pay_secret"
    ORANGE_PAY_URL: str = "https://api.orange.com/orange-money-webpay/dev/v1"
    ORANGE_SMS_TOKEN: str = "dev_sms_token"
    ORANGE_SMS_SENDER: str = "ARTEK"
    ORANGE_SMS_URL: str = "https://api.orange.com/smsmessaging/v1/outbound"

    # Google Meet (via Calendar API)
    GOOGLE_SERVICE_ACCOUNT_JSON: str = "{}"
    GOOGLE_CALENDAR_ID: str = "primary"
    GOOGLE_CALENDAR_IMPERSONATE: str = ""
    GOOGLE_MEET_DEV_URL: str = ""

    AWS_ACCESS_KEY_ID: str = "dev_aws_key"
    AWS_SECRET_ACCESS_KEY: str = "dev_aws_secret"
    AWS_REGION: str = "af-south-1"
    AWS_S3_BUCKET: str = "artek-medical-images"

    FIREBASE_SERVICE_ACCOUNT_JSON: str = "{}"
    SENTRY_DSN: str = ""

    MONGODB_URL: str = "mongodb://localhost:27017/artek_sante"
    INFLUXDB_URL: str = "http://localhost:8086"
    INFLUXDB_TOKEN: str = "devtoken"
    INFLUXDB_ORG: str = "artek"
    INFLUXDB_BUCKET: str = "artek_iot"

    MQTT_BROKER: str = "localhost"
    MQTT_PORT: int = 1883
    MQTT_USERNAME: str = "artek-kiosk"
    MQTT_PASSWORD: str = "devmqtt"


settings = Settings()
