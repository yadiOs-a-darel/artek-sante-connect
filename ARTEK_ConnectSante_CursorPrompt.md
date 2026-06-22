# ARTEK Connect Santé — Prompt Maître pour Cursor AI
## Contexte Projet Complet pour Exécution Automatisée

---

## 🎯 MISSION GLOBALE

Tu es l'architecte et développeur principal du projet **ARTEK Connect Santé** — une plateforme intégrée de télémédecine solaire pour la République Centrafricaine (RCA). Tu dois créer un **monorepo complet** contenant le backend, le frontend web, l'application mobile, les modèles IA, l'infrastructure IoT et toute la configuration DevOps. Ce projet doit être **production-ready**, documenté, testé et déployable immédiatement.

---

## 📁 STRUCTURE COMPLÈTE DU MONOREPO

```
artek-connect-sante/
├── .github/
│   └── workflows/
│       ├── deploy.yml           # CI/CD production
│       ├── test.yml             # Tests automatisés PR
│       └── security-scan.yml   # Analyse sécurité hebdo
├── apps/
│   ├── backend/                 # FastAPI Python — API principale
│   ├── web/                     # Next.js 14 — Dashboard médecins + PWA
│   └── mobile/                  # React Native + Expo — App patients/ASC
├── packages/
│   ├── ui/                      # Composants partagés React (design system)
│   ├── types/                   # Types TypeScript partagés (backend + frontend)
│   └── shared-utils/            # Utilitaires partagés (formatage, validation)
├── ml/
│   ├── models/                  # Modèles TensorFlow entraînés (.tflite, .h5)
│   ├── training/                # Scripts d'entraînement Python
│   └── datasets/                # Metadata datasets (pas les données brutes)
├── iot/
│   ├── kiosk-firmware/          # Scripts Raspberry Pi 4 (Python + Bash)
│   ├── ble-reader/              # Lecture capteurs BLE Bluetooth
│   └── mqtt-broker/             # Config Mosquitto MQTT
├── infra/
│   ├── terraform/               # Infrastructure AWS as Code
│   ├── docker/                  # Dockerfiles par service
│   └── k8s/                     # Manifestes Kubernetes K3s (optionnel)
├── docs/
│   ├── api/                     # Documentation OpenAPI / Swagger
│   ├── architecture/            # Diagrammes architecture (draw.io / Mermaid)
│   └── medical-protocols/       # Protocoles médicaux OMS IMCI
├── scripts/
│   ├── setup.sh                 # Installation environnement développement
│   ├── seed-db.sh               # Initialisation base de données
│   └── deploy.sh                # Déploiement production manuel
├── .env.example                 # Variables d'environnement (template)
├── .env.development             # Variables développement local
├── docker-compose.yml           # Orchestration développement local complète
├── docker-compose.prod.yml      # Orchestration production
├── Makefile                     # Commandes raccourcies (make dev, make test)
├── turbo.json                   # Configuration Turborepo (cache builds)
├── pnpm-workspace.yaml          # Workspace pnpm (packages JS/TS)
├── pyproject.toml               # Configuration Python workspace
└── README.md                    # Documentation principale
```

---

## 🔧 CONFIGURATION MONOREPO — FICHIERS RACINE

### `pnpm-workspace.yaml`
```yaml
packages:
  - 'apps/web'
  - 'apps/mobile'
  - 'packages/*'
```

### `turbo.json`
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "type-check": {
      "dependsOn": ["^build"]
    }
  }
}
```

### `Makefile`
```makefile
.PHONY: dev test build deploy lint clean seed

# Démarrer tous les services en développement
dev:
	docker-compose up -d db redis mongo influxdb
	pnpm turbo dev --parallel &
	cd apps/backend && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000

# Tests complets
test:
	cd apps/backend && pytest tests/ --cov=app --cov-report=html
	pnpm turbo test

# Build production
build:
	pnpm turbo build
	docker build -f infra/docker/backend.Dockerfile -t artek/backend:latest apps/backend/
	docker build -f infra/docker/web.Dockerfile -t artek/web:latest apps/web/

# Déploiement production
deploy:
	./scripts/deploy.sh

# Linting
lint:
	cd apps/backend && black app/ && isort app/ && flake8 app/
	pnpm turbo lint

# Nettoyage
clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -name "*.pyc" -delete
	pnpm turbo clean

# Initialisation base de données
seed:
	./scripts/seed-db.sh

# Installation complète
setup:
	./scripts/setup.sh
```

---

## 🐍 BACKEND — `apps/backend/`

### Stack
- **Python 3.11+**
- **FastAPI 0.110+** — API REST + WebSocket
- **SQLAlchemy 2.0+** (async) — ORM PostgreSQL
- **Celery 5.3+** — Tâches asynchrones (rappels SMS, rapports)
- **Redis** — Cache + broker Celery
- **Alembic** — Migrations base de données
- **pytest 8+** — Tests (cible : 90% coverage)

### `apps/backend/requirements.txt`
```
# Core FastAPI
fastapi==0.110.0
uvicorn[standard]==0.29.0
python-multipart==0.0.9
httpx==0.27.0

# Base de données
sqlalchemy[asyncio]==2.0.29
asyncpg==0.29.0
psycopg2-binary==2.9.9
alembic==1.13.1

# Validation
pydantic==2.6.4
pydantic-settings==2.2.1
email-validator==2.1.1

# Authentification
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4

# Cache / Queue
redis==5.0.3
celery[redis]==5.3.6
flower==2.0.1

# IA / ML
tensorflow==2.15.0
scikit-learn==1.4.1
pandas==2.2.1
numpy==1.26.4
opencv-python-headless==4.9.0.80
pillow==10.2.0
tflite-runtime==2.14.0

# NLP
transformers==4.38.2
sentencepiece==0.2.0
spacy==3.7.4

# IoT / BLE
bleak==0.21.1
paho-mqtt==2.0.0

# Sécurité
cryptography==42.0.5
slowapi==0.1.9

# Monitoring
prometheus-fastapi-instrumentator==7.0.0
sentry-sdk[fastapi]==1.45.0

# Télécom / Orange
qrcode[pil]==7.4.2
weasyprint==62.1

# Tests
pytest==8.0.2
pytest-asyncio==0.23.5
pytest-cov==5.0.0
factory-boy==3.3.0
httpx==0.27.0
respx==0.21.1

# Dev tools
black==24.3.0
isort==5.13.2
flake8==7.0.0
bandit==1.7.7
pre-commit==3.7.0
```

### Structure complète `apps/backend/app/`

```
app/
├── main.py                    # Point d'entrée FastAPI — CORS, routers, middleware
├── config.py                  # Settings Pydantic (variables .env)
├── database.py                # Connexion PostgreSQL async + session factory
├── deps.py                    # Dépendances FastAPI (get_db, get_current_user)
│
├── models/                    # Modèles SQLAlchemy (tables DB)
│   ├── __init__.py
│   ├── base.py                # BaseModel avec id UUID, created_at, updated_at
│   ├── patient.py             # Patient (téléphone Orange = identifiant unique)
│   ├── medecin.py             # Médecin (spécialité, disponibilité, localisation)
│   ├── consultation.py        # Consultation (vidéo/audio/différé, statut, paiement)
│   ├── ordonnance.py          # Ordonnance numérique (QR code, médicaments)
│   ├── dossier_medical.py     # DMN (antécédents, allergies, vaccins)
│   ├── mesure_vitale.py       # Constantes vitales IoT (tension, SpO2, temp)
│   ├── paiement.py            # Paiement Orange Money (ref, statut, montant)
│   ├── pharmacie.py           # Pharmacie partenaire (stock, localisation)
│   ├── kiosque.py             # Kiosque solaire (localisation, statut, batterie)
│   └── agent_sante.py         # Agent de Santé Communautaire (ASC)
│
├── schemas/                   # Schémas Pydantic (validation requêtes/réponses)
│   ├── __init__.py
│   ├── patient.py
│   ├── medecin.py
│   ├── consultation.py
│   ├── ordonnance.py
│   ├── paiement.py
│   ├── auth.py                # Login, token, refresh
│   ├── ia.py                  # Triage, diagnostic, résultats IA
│   └── kiosque.py
│
├── routers/                   # Endpoints API REST
│   ├── __init__.py
│   ├── auth.py                # POST /auth/login, /auth/refresh, /auth/logout
│   ├── patients.py            # CRUD /patients, /patients/{id}/dossier
│   ├── medecins.py            # CRUD /medecins, /medecins/disponibles
│   ├── consultations.py       # POST /consultations/create, GET /consultations/{id}
│   ├── ordonnances.py         # POST /ordonnances, GET /ordonnances/{qr_code}
│   ├── paiements.py           # POST /paiements/initier, /paiements/webhook
│   ├── ia.py                  # POST /ia/triage, /ia/diagnostic, /ia/malaria
│   ├── kiosques.py            # GET /kiosques, POST /kiosques/{id}/sync
│   ├── pharmacies.py          # GET /pharmacies, /pharmacies/stock
│   ├── rapports.py            # GET /rapports/epidemio, /rapports/mensuel
│   └── websocket.py           # WS /ws/consultation/{id} (temps réel)
│
├── services/                  # Logique métier (séparée des routers)
│   ├── __init__.py
│   ├── orange_money.py        # Intégration API Orange Money (paiement, webhook)
│   ├── orange_sms.py          # Envoi SMS Orange API (+236)
│   ├── orange_ussd.py         # Gateway USSD *144# (feature phones)
│   ├── video_call.py          # Daily.co WebRTC (création salle, token)
│   ├── ia_engine.py           # Moteur IA (triage, malaria, malnutrition)
│   ├── dossier_medical.py     # Gestion DMN (création, mise à jour, partage)
│   ├── ordonnance.py          # Génération QR code + PDF ordonnance
│   ├── notification.py        # Push FCM + SMS rappels médicaments
│   ├── pharmacie.py           # Stock pharmacies + livraison
│   └── rapport.py             # Génération rapports épidémio (HTML→PDF)
│
├── tasks/                     # Tâches Celery asynchrones
│   ├── __init__.py
│   ├── celery_app.py          # Configuration Celery (broker Redis)
│   ├── rappels.py             # Rappels médicaments automatiques (SMS)
│   ├── rapports.py            # Génération rapports épidémio hebdomadaires
│   ├── sync_kiosques.py       # Synchronisation données kiosques hors-ligne
│   └── notifications.py       # Envoi push notifications FCM
│
├── security/                  # Authentification et chiffrement
│   ├── __init__.py
│   ├── jwt.py                 # Génération/validation JWT (patients, médecins, admins)
│   ├── oauth2.py              # Flux OAuth2 (médecins, admins)
│   ├── encryption.py          # AES-256-GCM (données médicales sensibles)
│   ├── rate_limiter.py        # Rate limiting par IP et par utilisateur
│   └── permissions.py         # RBAC : patient / médecin / ASC / admin / pharmacie
│
├── integrations/              # Intégrations externes spécifiques
│   ├── __init__.py
│   ├── daily_co.py            # Client Daily.co API REST
│   ├── firebase.py            # Firebase Cloud Messaging (push Android)
│   ├── hl7_fhir.py            # Conversion données → format HL7 FHIR R4
│   └── aws_s3.py              # Upload images médicales AWS S3
│
├── middleware/                # Middlewares FastAPI
│   ├── __init__.py
│   ├── cors.py                # Configuration CORS
│   ├── logging.py             # Logging structuré JSON (Logstash)
│   ├── security_headers.py    # Headers sécurité (CSP, HSTS, X-Frame)
│   └── request_id.py          # UUID par requête (traçabilité)
│
└── utils/                     # Utilitaires génériques
    ├── __init__.py
    ├── phone.py               # Normalisation numéros téléphone RCA (+236)
    ├── pdf.py                 # Génération PDF (WeasyPrint)
    ├── qrcode.py              # Génération QR codes ordonnances
    └── validators.py          # Validations métier (NNI, téléphone Orange)
```

### `apps/backend/app/main.py` — Point d'entrée complet
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from prometheus_fastapi_instrumentator import Instrumentator
import sentry_sdk

from app.config import settings
from app.database import engine, Base
from app.routers import (
    auth, patients, medecins, consultations,
    ordonnances, paiements, ia, kiosques,
    pharmacies, rapports, websocket
)
from app.middleware.logging import LoggingMiddleware
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.middleware.request_id import RequestIDMiddleware
from app.security.rate_limiter import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

# Sentry (monitoring erreurs)
sentry_sdk.init(dsn=settings.SENTRY_DSN, traces_sample_rate=0.2)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup : créer tables si inexistantes
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown : fermer connexions
    await engine.dispose()

app = FastAPI(
    title="ARTEK Connect Santé API",
    description="API de télémédecine solaire pour la République Centrafricaine",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# Middlewares
app.add_middleware(RequestIDMiddleware)
app.add_middleware(LoggingMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Prometheus metrics
Instrumentator().instrument(app).expose(app, endpoint="/metrics")

# Routers
app.include_router(auth.router, prefix="/api/v1", tags=["Authentification"])
app.include_router(patients.router, prefix="/api/v1", tags=["Patients"])
app.include_router(medecins.router, prefix="/api/v1", tags=["Médecins"])
app.include_router(consultations.router, prefix="/api/v1", tags=["Consultations"])
app.include_router(ordonnances.router, prefix="/api/v1", tags=["Ordonnances"])
app.include_router(paiements.router, prefix="/api/v1", tags=["Paiements Orange"])
app.include_router(ia.router, prefix="/api/v1", tags=["IA Diagnostic"])
app.include_router(kiosques.router, prefix="/api/v1", tags=["Kiosques IoT"])
app.include_router(pharmacies.router, prefix="/api/v1", tags=["Pharmacies"])
app.include_router(rapports.router, prefix="/api/v1", tags=["Rapports"])
app.include_router(websocket.router, prefix="/api/v1", tags=["WebSocket"])

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "artek-connect-sante", "version": "1.0.0"}
```

### `apps/backend/app/config.py`
```python
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # App
    APP_NAME: str = "ARTEK Connect Santé"
    APP_ENV: str = "development"
    DEBUG: bool = False
    BASE_URL: str = "https://api.artek-sante.cf"
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "https://artek-sante.cf"]

    # Base de données PostgreSQL
    DATABASE_URL: str = "postgresql+asyncpg://artek:password@localhost:5432/artek_sante"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_PASSWORD: str = ""

    # JWT
    JWT_SECRET_KEY: str  # OBLIGATOIRE — générer avec: openssl rand -hex 32
    JWT_ALGORITHM: str = "HS256"
    JWT_PATIENT_EXPIRE_HOURS: int = 24
    JWT_MEDECIN_EXPIRE_HOURS: int = 8

    # AES-256 chiffrement données médicales
    MEDICAL_ENCRYPTION_KEY: str  # OBLIGATOIRE — 32 bytes en hex

    # Orange Money
    ORANGE_MERCHANT_KEY: str
    ORANGE_PAY_SECRET: str
    ORANGE_PAY_URL: str = "https://api.orange.com/orange-money-webpay/dev/v1"

    # Orange SMS API
    ORANGE_SMS_TOKEN: str
    ORANGE_SMS_SENDER: str = "ARTEK"
    ORANGE_SMS_URL: str = "https://api.orange.com/smsmessaging/v1/outbound"

    # Daily.co WebRTC
    DAILY_API_KEY: str
    DAILY_API_URL: str = "https://api.daily.co/v1"

    # AWS
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_REGION: str = "af-south-1"  # Cape Town — le plus proche de la RCA
    AWS_S3_BUCKET: str = "artek-medical-images"

    # Firebase FCM
    FIREBASE_SERVICE_ACCOUNT_JSON: str  # JSON stringifié

    # Sentry
    SENTRY_DSN: str = ""

    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017/artek_sante"

    # InfluxDB
    INFLUXDB_URL: str = "http://localhost:8086"
    INFLUXDB_TOKEN: str
    INFLUXDB_ORG: str = "artek"
    INFLUXDB_BUCKET: str = "artek_iot"

    # MQTT (kiosques IoT)
    MQTT_BROKER: str = "mqtt.artek-sante.cf"
    MQTT_PORT: int = 8883
    MQTT_USERNAME: str
    MQTT_PASSWORD: str

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

### `apps/backend/app/models/patient.py` — Modèle complet
```python
from sqlalchemy import Column, String, Boolean, DateTime, Enum, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum
from app.models.base import Base

class Genre(str, enum.Enum):
    masculin = "masculin"
    feminin = "feminin"
    autre = "autre"

class Patient(Base):
    __tablename__ = "patients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # Numéro Orange = identifiant universel en RCA
    telephone = Column(String(20), unique=True, nullable=False, index=True)
    nom_chiffre = Column(Text, nullable=False)  # AES-256 chiffré
    prenom_chiffre = Column(Text, nullable=False)  # AES-256 chiffré
    date_naissance_chiffre = Column(Text)  # AES-256 chiffré
    genre = Column(Enum(Genre))
    nni = Column(String(20), unique=True)  # Numéro National d'Identité (si disponible)
    prefecture = Column(String(50), nullable=False)
    village = Column(String(100))
    langue_preferee = Column(String(10), default="fr")  # "fr" ou "sg" (sango)
    est_femme_enceinte = Column(Boolean, default=False)
    consentement = Column(Boolean, nullable=False, default=False)
    est_actif = Column(Boolean, default=True)
    # Abonnement famille
    abonnement_famille_actif = Column(Boolean, default=False)
    abonnement_expire_le = Column(DateTime)

    # Relations
    consultations = relationship("Consultation", back_populates="patient")
    dossier_medical = relationship("DossierMedical", back_populates="patient", uselist=False)
    mesures_vitales = relationship("MesureVitale", back_populates="patient")
    paiements = relationship("Paiement", back_populates="patient")
```

### `apps/backend/app/services/orange_money.py` — Intégration complète
```python
import httpx
import hashlib
from app.config import settings
from app.schemas.paiement import PaiementInitResponse, PaiementStatut

async def initier_paiement(
    montant: int,
    telephone: str,
    reference: str,
    description: str = "Consultation ARTEK Santé"
) -> PaiementInitResponse:
    """Initie un paiement Orange Money — retourne URL de paiement"""
    hash_str = f"{settings.ORANGE_PAY_SECRET}{montant}{reference}"
    security_hash = hashlib.sha512(hash_str.encode()).hexdigest()

    payload = {
        "merchant_key": settings.ORANGE_MERCHANT_KEY,
        "currency": "CFA",
        "order_id": reference,
        "amount": str(montant),
        "return_url": f"{settings.BASE_URL}/paiement/retour/{reference}",
        "cancel_url": f"{settings.BASE_URL}/paiement/annule/{reference}",
        "notif_url": f"{settings.BASE_URL}/api/v1/paiements/webhook/orange-money",
        "lang": "fr",
        "reference": f"ARTEK-{reference}",
        "hash": security_hash,
        "customer_phone": f"+236{telephone}",
        "description": description,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            f"{settings.ORANGE_PAY_URL}/webpayment",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        resp.raise_for_status()
        data = resp.json()

    return PaiementInitResponse(
        payment_url=data["payment_url"],
        token=data["token"],
        reference=reference
    )

async def verifier_paiement(token: str) -> PaiementStatut:
    """Vérifie le statut d'un paiement Orange Money"""
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(
            f"{settings.ORANGE_PAY_URL}/webpayment/{token}",
            headers={"Authorization": f"Bearer {settings.ORANGE_MERCHANT_KEY}"}
        )
        data = resp.json()

    return PaiementStatut(
        statut=data.get("status"),
        montant=data.get("amount"),
        reference=data.get("order_id"),
        telephone=data.get("customer_phone")
    )
```

### `apps/backend/app/services/ia_engine.py` — Moteur IA
```python
import numpy as np
import tflite_runtime.interpreter as tflite
from pathlib import Path
import cv2
from sklearn.ensemble import RandomForestClassifier
import joblib
from app.schemas.ia import TriageResult, DiagnosticMalariaResult

MODEL_DIR = Path(__file__).parent.parent.parent / "ml" / "models"

class IAEngine:
    """Moteur IA ARTEK — Triage, Malaria, Malnutrition, Chatbot"""

    def __init__(self):
        # Charger modèle triage (Random Forest — léger, < 50ms)
        self.triage_model = joblib.load(MODEL_DIR / "triage_rf.pkl")
        # Charger modèle malaria (TFLite — < 800ms sur RPi4)
        self.malaria_interpreter = tflite.Interpreter(
            model_path=str(MODEL_DIR / "malaria_v1.tflite")
        )
        self.malaria_interpreter.allocate_tensors()
        # Charger modèle malnutrition (TFLite)
        self.malnutrition_interpreter = tflite.Interpreter(
            model_path=str(MODEL_DIR / "malnutrition_v1.tflite")
        )
        self.malnutrition_interpreter.allocate_tensors()

    def triage_symptomes(self, symptomes: dict) -> TriageResult:
        """
        Triage symptômes — score 0-100 + niveau (rouge/orange/vert)
        Input: dict avec clés: fievre, toux, douleur_abdominale, etc.
        Protocoles OMS IMCI intégrés
        """
        features = self._symptomes_to_features(symptomes)
        proba = self.triage_model.predict_proba([features])[0]
        score = int(proba[1] * 100)  # Score de gravité

        if score >= 70:
            niveau = "rouge"
            recommandation = "urgence_medicale"
            message = "Cas urgent — consultation immédiate requise"
        elif score >= 40:
            niveau = "orange"
            recommandation = "teleconsultation"
            message = "Téléconsultation recommandée dans les 24h"
        else:
            niveau = "vert"
            recommandation = "conseils_sante"
            message = "Pas d'urgence — conseils santé suffisants"

        return TriageResult(
            score=score,
            niveau=niveau,
            recommandation=recommandation,
            message=message,
            latence_ms=50
        )

    def detecter_malaria(self, image_bytes: bytes) -> DiagnosticMalariaResult:
        """
        Détection paludisme sur image frottis sanguin
        Modèle: MobileNetV3Small — 96.8% précision
        """
        # Prétraitement image
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        img = cv2.resize(img, (224, 224))
        img = img.astype(np.float32) / 255.0
        img = np.expand_dims(img, axis=0)

        # Inférence TFLite
        input_details = self.malaria_interpreter.get_input_details()
        output_details = self.malaria_interpreter.get_output_details()
        self.malaria_interpreter.set_tensor(input_details[0]['index'], img)
        self.malaria_interpreter.invoke()
        output = self.malaria_interpreter.get_tensor(output_details[0]['index'])

        probabilite = float(output[0][0])
        positif = probabilite > 0.5
        confiance = probabilite if positif else 1 - probabilite

        return DiagnosticMalariaResult(
            positif=positif,
            probabilite=round(probabilite, 4),
            confiance=round(confiance * 100, 1),
            recommandation="Test RDT confirmé requis" if positif else "Continuer surveillance",
            precision_modele=96.8
        )

    def _symptomes_to_features(self, symptomes: dict) -> list:
        """Convertit les symptômes en vecteur numérique pour Random Forest"""
        return [
            symptomes.get("fievre_temperature", 37.0),
            int(symptomes.get("toux", False)),
            int(symptomes.get("diarrhee", False)),
            int(symptomes.get("vomissements", False)),
            int(symptomes.get("maux_tete", False)),
            int(symptomes.get("douleur_thoracique", False)),
            int(symptomes.get("difficulte_respiratoire", False)),
            int(symptomes.get("perte_conscience", False)),
            symptomes.get("frequence_cardiaque", 70),
            symptomes.get("spo2", 98),
            symptomes.get("age_ans", 30),
            int(symptomes.get("est_enceinte", False)),
        ]

# Singleton
ia_engine = IAEngine()
```

### Migrations Alembic — `apps/backend/migrations/`
```
migrations/
├── env.py              # Configuration Alembic (URL DB async)
├── script.py.mako      # Template migration
└── versions/
    ├── 001_create_patients.py
    ├── 002_create_medecins.py
    ├── 003_create_consultations.py
    ├── 004_create_ordonnances.py
    ├── 005_create_paiements.py
    ├── 006_create_kiosques.py
    └── 007_create_mesures_vitales.py
```

### Tests — `apps/backend/tests/`
```
tests/
├── conftest.py         # Fixtures pytest (DB test, client FastAPI test)
├── factories/          # Factory Boy (génération données test)
│   ├── patient.py
│   ├── medecin.py
│   └── consultation.py
├── test_auth.py        # Tests authentification JWT
├── test_patients.py    # Tests CRUD patients
├── test_consultations.py
├── test_paiements.py   # Tests Orange Money (mock API)
├── test_ia.py          # Tests moteur IA (images test)
└── test_websocket.py   # Tests WebSocket temps réel
```

---

## 🌐 FRONTEND WEB — `apps/web/`

### Stack
- **Next.js 14** (App Router)
- **React 18** + TypeScript 5
- **Tailwind CSS 3.4** + **shadcn/ui**
- **React Query 5** (cache API)
- **Zustand 4** (état global)
- **Daily.co SDK** (appels vidéo)

### `apps/web/package.json`
```json
{
  "name": "@artek/web",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "14.2.1",
    "react": "18.3.0",
    "react-dom": "18.3.0",
    "@tanstack/react-query": "5.32.0",
    "zustand": "4.5.2",
    "@daily-co/daily-js": "0.57.0",
    "axios": "1.6.8",
    "date-fns": "3.6.0",
    "recharts": "2.12.3",
    "react-hook-form": "7.51.3",
    "zod": "3.23.4",
    "@hookform/resolvers": "3.3.4",
    "framer-motion": "11.0.28",
    "react-i18next": "14.1.1",
    "i18next": "23.11.2",
    "qrcode.react": "3.1.0",
    "leaflet": "1.9.4",
    "react-leaflet": "4.2.1",
    "lucide-react": "0.376.0"
  },
  "devDependencies": {
    "typescript": "5.4.5",
    "@types/react": "18.3.1",
    "@types/node": "20.12.7",
    "tailwindcss": "3.4.3",
    "autoprefixer": "10.4.19",
    "postcss": "8.4.38",
    "@testing-library/react": "15.0.5",
    "jest": "29.7.0"
  }
}
```

### Structure `apps/web/src/`
```
src/
├── app/                        # Next.js 14 App Router
│   ├── layout.tsx              # Layout racine (providers, fonts)
│   ├── page.tsx                # Landing page publique
│   ├── (auth)/
│   │   ├── login/page.tsx      # Connexion médecin (téléphone + PIN)
│   │   └── inscription/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Layout dashboard (sidebar, navbar)
│   │   ├── accueil/page.tsx    # Vue d'ensemble médecin
│   │   ├── agenda/page.tsx     # Planning consultations du jour
│   │   ├── patients/
│   │   │   ├── page.tsx        # Liste patients
│   │   │   └── [id]/page.tsx   # Fiche patient + DMN
│   │   ├── consultation/
│   │   │   ├── [id]/page.tsx   # Salle de consultation vidéo
│   │   │   └── nouvelle/page.tsx
│   │   ├── ordonnances/
│   │   │   ├── page.tsx
│   │   │   └── nouvelle/page.tsx
│   │   ├── rapports/page.tsx   # Rapports épidémiologiques
│   │   └── parametres/page.tsx
│   ├── (admin)/
│   │   ├── kiosques/page.tsx   # Monitoring kiosques (carte + statut)
│   │   ├── pharmacies/page.tsx
│   │   └── epidemio/page.tsx   # Tableau de bord épidémio national
│   └── api/                    # Routes API Next.js (proxy backend)
│       └── health/route.ts
│
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Navbar.tsx
│   │   └── MobileNav.tsx
│   ├── consultation/
│   │   ├── VideoCall.tsx       # Composant Daily.co WebRTC
│   │   ├── AudioCall.tsx       # Mode dégradé audio seul
│   │   ├── ChatConsultation.tsx # Mode texte + photos
│   │   └── ConsultationCard.tsx
│   ├── patient/
│   │   ├── PatientCard.tsx
│   │   ├── DossierMedical.tsx
│   │   ├── ConstantesVitales.tsx # Graphiques SpO2, tension
│   │   └── HistoriqueConsultations.tsx
│   ├── ordonnance/
│   │   ├── OrdonnanceForm.tsx
│   │   ├── OrdonnancePDF.tsx   # Prévisualisation PDF
│   │   └── QRCodeOrdonnance.tsx
│   ├── maps/
│   │   ├── KiosqueMap.tsx      # Carte Leaflet kiosques RCA
│   │   └── MarkerKiosque.tsx
│   └── ia/
│       ├── TriageResult.tsx    # Affichage résultat triage IA
│       └── DiagnosticCard.tsx
│
├── lib/
│   ├── api.ts                  # Client Axios (intercepteurs, refresh token)
│   ├── query-client.ts         # React Query configuration
│   ├── auth.ts                 # Helpers authentification
│   └── utils.ts                # cn(), formatDate(), formatPhone()
│
├── hooks/
│   ├── useAuth.ts
│   ├── useConsultation.ts
│   ├── useVideoCall.ts         # Hook Daily.co
│   ├── usePatient.ts
│   └── useWebSocket.ts         # Hook WebSocket temps réel
│
├── store/
│   ├── auth.store.ts           # Zustand — session médecin
│   ├── consultation.store.ts   # Zustand — consultation en cours
│   └── notification.store.ts  # Zustand — notifications
│
├── locales/
│   ├── fr/
│   │   ├── common.json
│   │   ├── medical.json
│   │   └── errors.json
│   └── sg/                     # Sango (langue nationale RCA)
│       ├── common.json
│       └── medical.json
│
└── types/
    ├── patient.ts
    ├── medecin.ts
    ├── consultation.ts
    └── api.ts
```

### Page clé — `apps/web/src/app/(dashboard)/consultation/[id]/page.tsx`
```tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import VideoCall from "@/components/consultation/VideoCall";
import PatientCard from "@/components/patient/PatientCard";
import OrdonnanceForm from "@/components/ordonnance/OrdonnanceForm";
import ConstantesVitales from "@/components/patient/ConstantesVitales";
import { useConsultation } from "@/hooks/useConsultation";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Badge } from "@/components/ui/badge";

export default function ConsultationPage() {
  const { id } = useParams<{ id: string }>();
  const { consultation, patient, isLoading } = useConsultation(id);
  const { constantes, messages } = useWebSocket(id);
  const [mode, setMode] = useState<"video" | "audio" | "chat">("video");

  if (isLoading) return <ConsultationSkeleton />;

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Zone vidéo principale */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 relative">
          {mode === "video" && <VideoCall consultationId={id} />}
          {mode === "audio" && <AudioCall consultationId={id} />}
          <NetworkQualityIndicator onDegrade={() => setMode("audio")} />
        </div>
        <CallControls mode={mode} onModeChange={setMode} consultationId={id} />
      </div>

      {/* Panneau latéral — informations patient */}
      <aside className="w-80 bg-gray-900 border-l border-gray-800 overflow-y-auto">
        <PatientCard patient={patient} compact />
        <ConstantesVitales constantes={constantes} compact />
        <OrdonnanceForm consultationId={id} patientId={patient.id} />
      </aside>
    </div>
  );
}
```

---

## 📱 MOBILE — `apps/mobile/`

### Stack
- **React Native 0.73** + Expo 50
- **Expo Router** (file-based navigation)
- **TypeScript 5**
- **React Query 5** + **Zustand 4**
- **Daily.co React Native SDK**
- **React Native BLE PLX** (capteurs médicaux)

### `apps/mobile/package.json`
```json
{
  "name": "@artek/mobile",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "build:android": "eas build --platform android",
    "build:ios": "eas build --platform ios"
  },
  "dependencies": {
    "expo": "~50.0.17",
    "expo-router": "~3.5.14",
    "react-native": "0.73.6",
    "react": "18.2.0",
    "@daily-co/react-native-daily-js": "0.57.0",
    "react-native-ble-plx": "3.1.2",
    "expo-camera": "~14.1.2",
    "expo-barcode-scanner": "~12.9.3",
    "expo-secure-store": "~12.8.1",
    "expo-notifications": "~0.27.7",
    "@react-navigation/native": "6.1.17",
    "@tanstack/react-query": "5.32.0",
    "zustand": "4.5.2",
    "react-native-maps": "1.14.0",
    "victory-native": "40.1.3",
    "i18next": "23.11.2",
    "react-i18next": "14.1.1",
    "react-hook-form": "7.51.3",
    "zod": "3.23.4",
    "axios": "1.6.8",
    "@rneui/themed": "4.0.0-rc.8"
  }
}
```

### Structure `apps/mobile/app/`
```
app/
├── _layout.tsx              # Layout racine (providers, fonts, navigation)
├── (auth)/
│   ├── _layout.tsx
│   ├── bienvenue.tsx        # Écran d'accueil avec logo ARTEK
│   ├── telephone.tsx        # Saisie numéro Orange (+236...)
│   ├── otp.tsx              # Vérification OTP SMS Orange
│   └── profil.tsx           # Complétion profil (genre, préfecture)
├── (patient)/
│   ├── _layout.tsx          # Tab navigator patient
│   ├── accueil.tsx          # Dashboard patient (prochaine consultation, historique)
│   ├── consultation/
│   │   ├── index.tsx        # Liste médecins disponibles
│   │   ├── [id].tsx         # Profil médecin + bouton "Consulter"
│   │   ├── paiement.tsx     # Paiement Orange Money (in-app ou USSD)
│   │   ├── attente.tsx      # Salle d'attente virtuelle
│   │   └── video.tsx        # Appel vidéo Daily.co
│   ├── dossier.tsx          # Dossier Médical Numérique
│   ├── ordonnances.tsx      # Liste ordonnances + QR codes
│   ├── mesures.tsx          # Mes constantes vitales (graphiques)
│   └── profil.tsx           # Paramètres profil
├── (medecin)/
│   ├── _layout.tsx
│   ├── agenda.tsx           # Planning du jour
│   ├── patient/[id].tsx     # Fiche patient complète
│   ├── consultation/
│   │   ├── attente.tsx      # File d'attente patients
│   │   └── video.tsx        # Consultation vidéo médecin
│   └── prescriptions.tsx    # Rédaction ordonnances
├── (kiosque)/
│   ├── _layout.tsx          # Mode kiosque ASC (plein écran)
│   ├── accueil.tsx          # Écran d'accueil kiosque
│   ├── patient.tsx          # Identification patient (numéro Orange)
│   ├── triage.tsx           # Questionnaire triage IA
│   ├── mesures.tsx          # Prise constantes BLE (capteurs)
│   └── consultation.tsx     # Lancement consultation
└── +not-found.tsx
```

### Composant clé — `apps/mobile/app/(kiosque)/mesures.tsx`
```tsx
import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { BleManager, Device } from "react-native-ble-plx";
import { router } from "expo-router";

const BLOOD_PRESSURE_UUID = "00002A35-0000-1000-8000-00805f9b34fb";
const OXIMETER_UUID = "00002A37-0000-1000-8000-00805f9b34fb";
const THERMOMETER_UUID = "00002A1C-0000-1000-8000-00805f9b34fb";

export default function PriseMesures() {
  const manager = new BleManager();
  const [constantes, setConstantes] = useState({
    tension: null, spo2: null, temperature: null, bpm: null,
  });
  const [scanning, setScanning] = useState(false);

  const scannerCapteurs = async () => {
    setScanning(true);
    manager.startDeviceScan(null, null, async (error, device) => {
      if (error || !device) return;
      // Filtrer par nom (capteurs ARTEK)
      if (device.name?.includes("ARTEK") || device.name?.includes("Omron")) {
        manager.stopDeviceScan();
        await lireCapteur(device);
      }
    });
    setScanning(false);
  };

  const lireCapteur = async (device: Device) => {
    const connected = await device.connect();
    await connected.discoverAllServicesAndCharacteristics();

    // Tension artérielle
    const taData = await connected.readCharacteristicForService(
      "00001810-0000-1000-8000-00805f9b34fb", BLOOD_PRESSURE_UUID
    );
    if (taData?.value) {
      const bytes = Buffer.from(taData.value, "base64");
      const sys = bytes.readUInt16LE(1) / 10;
      const dia = bytes.readUInt16LE(3) / 10;
      setConstantes(prev => ({ ...prev, tension: `${sys}/${dia}` }));
    }

    // SpO2 + FC
    const spo2Data = await connected.readCharacteristicForService(
      "0000180D-0000-1000-8000-00805f9b34fb", OXIMETER_UUID
    );
    if (spo2Data?.value) {
      const bytes = Buffer.from(spo2Data.value, "base64");
      setConstantes(prev => ({ ...prev, spo2: bytes[1], bpm: bytes[3] }));
    }

    await connected.cancelConnection();
  };

  return (
    <View className="flex-1 bg-gray-950 p-6">
      <Text className="text-white text-2xl font-bold mb-6">
        Prise des Constantes Vitales
      </Text>

      <TouchableOpacity
        onPress={scannerCapteurs}
        className="bg-orange-500 rounded-xl p-4 mb-8"
      >
        <Text className="text-white text-center font-semibold text-lg">
          {scanning ? "Recherche capteurs BLE..." : "Démarrer la mesure"}
        </Text>
      </TouchableOpacity>

      <VitalsDisplay constantes={constantes} />

      {constantes.spo2 && constantes.tension && (
        <TouchableOpacity
          onPress={() => router.push("/(kiosque)/consultation")}
          className="bg-green-600 rounded-xl p-4 mt-6"
        >
          <Text className="text-white text-center font-bold text-lg">
            Lancer la téléconsultation →
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
```

---

## 🤖 ML — `ml/`

### Structure
```
ml/
├── models/
│   ├── malaria_v1.tflite          # Modèle paludisme (3.2 MB — RPi4 ready)
│   ├── malnutrition_v1.tflite     # Dépistage malnutrition (2.1 MB)
│   ├── triage_rf.pkl              # Triage Random Forest (1.8 MB)
│   └── chatbot_distilbert/        # DistilBERT FR/Sango (66 MB — cloud only)
│       ├── config.json
│       ├── pytorch_model.bin
│       └── tokenizer.json
├── training/
│   ├── train_malaria.py           # Entraînement MobileNetV3Small
│   ├── train_triage.py            # Entraînement Random Forest OMS IMCI
│   ├── train_malnutrition.py      # CNN screening malnutrition
│   ├── train_chatbot.py           # Fine-tuning DistilBERT FR/Sango
│   ├── evaluate_models.py         # Évaluation performances (ROC, F1)
│   └── export_tflite.py           # Export et optimisation TFLite (int8)
├── datasets/
│   ├── README.md                  # Sources datasets (NIH, OMS, RCA local)
│   ├── malaria_metadata.csv       # Métadonnées dataset malaria (42K images)
│   └── triage_symptoms.csv        # Cas de triage (12K cas OMS IMCI)
└── requirements.txt               # Dépendances ML (TF, PyTorch, sklearn)
```

### `ml/training/train_malaria.py`
```python
"""
Entraînement modèle détection paludisme — MobileNetV3Small
Dataset: NIH Cell Images (27K) + images locales RCA (15K)
Précision cible: > 96%
"""
import tensorflow as tf
import mlflow
import mlflow.keras
from pathlib import Path

DATA_DIR = Path("datasets/malaria/")
MODEL_DIR = Path("models/")
EPOCHS = 30
BATCH_SIZE = 32
IMG_SIZE = (224, 224)

def build_model():
    base = tf.keras.applications.MobileNetV3Small(
        weights="imagenet", include_top=False, input_shape=(*IMG_SIZE, 3)
    )
    base.trainable = False  # Phase 1: transfer learning

    return tf.keras.Sequential([
        base,
        tf.keras.layers.GlobalAveragePooling2D(),
        tf.keras.layers.BatchNormalization(),
        tf.keras.layers.Dense(256, activation="relu"),
        tf.keras.layers.Dropout(0.4),
        tf.keras.layers.Dense(128, activation="relu"),
        tf.keras.layers.Dropout(0.3),
        tf.keras.layers.Dense(1, activation="sigmoid")
    ])

def train():
    # Dataset avec augmentation
    train_ds = tf.keras.utils.image_dataset_from_directory(
        DATA_DIR / "train", image_size=IMG_SIZE, batch_size=BATCH_SIZE,
        label_mode="binary", validation_split=0.2, subset="training", seed=42
    )
    val_ds = tf.keras.utils.image_dataset_from_directory(
        DATA_DIR / "train", image_size=IMG_SIZE, batch_size=BATCH_SIZE,
        label_mode="binary", validation_split=0.2, subset="validation", seed=42
    )

    # Augmentation données
    augmentation = tf.keras.Sequential([
        tf.keras.layers.RandomFlip("horizontal_and_vertical"),
        tf.keras.layers.RandomRotation(0.2),
        tf.keras.layers.RandomZoom(0.1),
        tf.keras.layers.RandomBrightness(0.1),
    ])

    train_ds = train_ds.map(lambda x, y: (augmentation(x, training=True), y))
    train_ds = train_ds.prefetch(tf.data.AUTOTUNE)
    val_ds = val_ds.prefetch(tf.data.AUTOTUNE)

    model = build_model()
    model.compile(
        optimizer=tf.keras.optimizers.Adam(1e-3),
        loss="binary_crossentropy",
        metrics=["accuracy", tf.keras.metrics.AUC(name="auc")]
    )

    with mlflow.start_run(run_name="malaria_mobilenetv3_phase1"):
        # Phase 1: couches de base gelées
        history = model.fit(
            train_ds, validation_data=val_ds, epochs=15,
            callbacks=[
                tf.keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True),
                tf.keras.callbacks.ReduceLROnPlateau(factor=0.3, patience=3),
            ]
        )
        mlflow.log_metrics({"val_accuracy": max(history.history["val_accuracy"])})

        # Phase 2: fine-tuning couches hautes
        model.layers[0].trainable = True
        for layer in model.layers[0].layers[:-30]:
            layer.trainable = False

        model.compile(
            optimizer=tf.keras.optimizers.Adam(1e-5),
            loss="binary_crossentropy",
            metrics=["accuracy", tf.keras.metrics.AUC(name="auc")]
        )
        history2 = model.fit(train_ds, validation_data=val_ds, epochs=15)

        final_acc = max(history2.history["val_accuracy"])
        mlflow.log_metrics({"val_accuracy_finetuned": final_acc})
        mlflow.keras.log_model(model, "malaria_model")
        print(f"✅ Précision finale: {final_acc:.1%}")

    # Export TFLite optimisé (quantification int8)
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    converter.target_spec.supported_types = [tf.int8]
    tflite_model = converter.convert()

    tflite_path = MODEL_DIR / "malaria_v1.tflite"
    tflite_path.write_bytes(tflite_model)
    print(f"✅ Modèle TFLite exporté: {len(tflite_model)/1024:.0f} KB")

if __name__ == "__main__":
    train()
```

---

## 🏥 IoT KIOSQUES — `iot/`

### Structure
```
iot/
├── kiosk-firmware/
│   ├── main.py              # Point d'entrée Raspberry Pi 4
│   ├── config.py            # Configuration kiosque (ID, préfecture, réseau)
│   ├── ble_reader.py        # Lecture capteurs BLE (tensiomètre, oxymètre)
│   ├── sync_manager.py      # Synchronisation online/offline avec backend
│   ├── battery_monitor.py   # Monitoring batterie solaire (ESP32)
│   ├── display_manager.py   # Gestion écran tablette Samsung
│   └── scripts/
│       ├── startup.sh       # Script démarrage au boot (systemd)
│       ├── update.sh        # Mise à jour silencieuse OTA
│       ├── backup.sh        # Sauvegarde locale SQLite
│       └── health_check.sh  # Monitoring CPU/RAM/réseau
├── ble-reader/
│   └── ble_reader.py        # Voir code section Backend
└── mqtt-broker/
    ├── mosquitto.conf        # Config Mosquitto (TLS 1.3, auth)
    └── docker-compose.yml    # Mosquitto en container
```

### `iot/kiosk-firmware/main.py`
```python
"""
ARTEK Kiosque Firmware — Raspberry Pi 4
Démarrage automatique au boot via systemd
"""
import asyncio
import logging
from pathlib import Path
from ble_reader import BLEReader
from sync_manager import SyncManager
from battery_monitor import BatteryMonitor

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [KIOSQUE] %(levelname)s: %(message)s",
    handlers=[
        logging.FileHandler("/var/log/artek-kiosk.log"),
        logging.StreamHandler()
    ]
)
log = logging.getLogger(__name__)

KIOSK_ID = "kiosque-ouham-01"  # Identifiant unique kiosque
BACKEND_URL = "https://api.artek-sante.cf/api/v1"

async def main():
    log.info(f"🏥 Démarrage ARTEK Kiosque {KIOSK_ID}")

    ble = BLEReader()
    sync = SyncManager(kiosk_id=KIOSK_ID, backend_url=BACKEND_URL)
    battery = BatteryMonitor()

    # Démarrer monitoring batterie en arrière-plan
    asyncio.create_task(battery.monitor_loop())

    # Démarrer synchronisation périodique
    asyncio.create_task(sync.sync_loop(interval_minutes=5))

    log.info("✅ Kiosque prêt — En attente de patients")

    # Boucle principale
    while True:
        await asyncio.sleep(60)
        await sync.check_connectivity()

if __name__ == "__main__":
    asyncio.run(main())
```

### `iot/kiosk-firmware/scripts/startup.sh`
```bash
#!/bin/bash
# /etc/systemd/system/artek-kiosk.service
# Démarrage automatique du firmware ARTEK au boot

set -euo pipefail

VENV_PATH="/opt/artek/venv"
APP_PATH="/opt/artek/kiosk-firmware"
LOG_FILE="/var/log/artek-kiosk.log"

echo "[$(date)] Démarrage ARTEK Kiosque..." >> "$LOG_FILE"

# Vérifier connexion réseau (attente max 60s)
for i in {1..12}; do
    if ping -c 1 api.artek-sante.cf &>/dev/null; then
        echo "[$(date)] Réseau disponible" >> "$LOG_FILE"
        break
    fi
    echo "[$(date)] Attente réseau... ($i/12)" >> "$LOG_FILE"
    sleep 5
done

# Activer virtualenv et démarrer
source "$VENV_PATH/bin/activate"
cd "$APP_PATH"
python main.py >> "$LOG_FILE" 2>&1
```

---

## 🐳 INFRASTRUCTURE — `infra/`

### `docker-compose.yml` — Développement local complet
```yaml
version: '3.9'

services:
  # Base de données principale
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: artek_sante
      POSTGRES_USER: artek
      POSTGRES_PASSWORD: ${DB_PASSWORD:-devpassword}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./infra/docker/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U artek"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Cache + Broker Celery
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD:-devredis}
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # Documents médicaux non structurés
  mongo:
    image: mongo:7-jammy
    environment:
      MONGO_INITDB_ROOT_USERNAME: artek
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD:-devmongo}
      MONGO_INITDB_DATABASE: artek_sante
    volumes:
      - mongo_data:/data/db
    ports:
      - "27017:27017"

  # Métriques IoT temps réel
  influxdb:
    image: influxdb:2-alpine
    environment:
      DOCKER_INFLUXDB_INIT_MODE: setup
      DOCKER_INFLUXDB_INIT_USERNAME: artek
      DOCKER_INFLUXDB_INIT_PASSWORD: ${INFLUX_PASSWORD:-devinflux}
      DOCKER_INFLUXDB_INIT_ORG: artek
      DOCKER_INFLUXDB_INIT_BUCKET: artek_iot
      DOCKER_INFLUXDB_INIT_ADMIN_TOKEN: ${INFLUXDB_TOKEN:-devtoken}
    ports:
      - "8086:8086"
    volumes:
      - influx_data:/var/lib/influxdb2

  # Backend FastAPI
  api:
    build:
      context: ./apps/backend
      dockerfile: ../../infra/docker/backend.Dockerfile
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    environment:
      DATABASE_URL: postgresql+asyncpg://artek:${DB_PASSWORD:-devpassword}@db:5432/artek_sante
      REDIS_URL: redis://:${REDIS_PASSWORD:-devredis}@redis:6379/0
      MONGODB_URL: mongodb://artek:${MONGO_PASSWORD:-devmongo}@mongo:27017/artek_sante
      INFLUXDB_URL: http://influxdb:8086
      INFLUXDB_TOKEN: ${INFLUXDB_TOKEN:-devtoken}
      JWT_SECRET_KEY: ${JWT_SECRET_KEY:-dev-secret-change-in-prod-32chars}
      MEDICAL_ENCRYPTION_KEY: ${MEDICAL_ENCRYPTION_KEY:-devkey32byteschangeinproduction!}
      APP_ENV: development
      DEBUG: "true"
    volumes:
      - ./apps/backend:/app
      - ./ml/models:/app/ml/models
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started

  # Worker Celery (tâches async)
  celery:
    build:
      context: ./apps/backend
      dockerfile: ../../infra/docker/backend.Dockerfile
    command: celery -A app.tasks.celery_app worker --loglevel=info --concurrency=2
    environment:
      DATABASE_URL: postgresql+asyncpg://artek:${DB_PASSWORD:-devpassword}@db:5432/artek_sante
      REDIS_URL: redis://:${REDIS_PASSWORD:-devredis}@redis:6379/0
    depends_on: [redis, db]

  # Monitoring Celery
  flower:
    build:
      context: ./apps/backend
      dockerfile: ../../infra/docker/backend.Dockerfile
    command: celery -A app.tasks.celery_app flower --port=5555
    ports:
      - "5555:5555"
    depends_on: [celery]

  # Frontend Web
  web:
    build:
      context: ./apps/web
      dockerfile: ../../infra/docker/web.Dockerfile
    command: pnpm dev
    volumes:
      - ./apps/web:/app
      - /app/node_modules
      - /app/.next
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
      NEXT_PUBLIC_DAILY_URL: ${DAILY_API_KEY}

  # Monitoring infrastructure
  grafana:
    image: grafana/grafana:10.4.2
    ports:
      - "3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./infra/grafana/dashboards:/etc/grafana/provisioning/dashboards
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD:-devgrafana}

  prometheus:
    image: prom/prometheus:v2.51.2
    ports:
      - "9090:9090"
    volumes:
      - ./infra/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml

  # Broker MQTT pour kiosques IoT
  mosquitto:
    image: eclipse-mosquitto:2.0.18
    ports:
      - "1883:1883"
      - "8883:8883"
    volumes:
      - ./iot/mqtt-broker/mosquitto.conf:/mosquitto/config/mosquitto.conf
      - mosquitto_data:/mosquitto/data

volumes:
  postgres_data:
  redis_data:
  mongo_data:
  influx_data:
  grafana_data:
  mosquitto_data:
```

### `infra/docker/backend.Dockerfile`
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Dépendances système (OpenCV, WeasyPrint)
RUN apt-get update && apt-get install -y \
    libglib2.0-0 libsm6 libxext6 libxrender-dev libgomp1 \
    libpango-1.0-0 libpangoft2-1.0-0 libpangocairo-1.0-0 \
    libcairo2 libgdk-pixbuf2.0-0 libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Dépendances Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Code source
COPY . .

# Utilisateur non-root
RUN useradd -m -u 1000 artek && chown -R artek:artek /app
USER artek

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

---

## 🔐 CI/CD — `.github/workflows/`

### `.github/workflows/deploy.yml`
```yaml
name: CI/CD ARTEK Connect Santé

on:
  push:
    branches: [main]
  pull_request:
    branches: [main, develop]

env:
  AWS_REGION: af-south-1
  ECR_REPOSITORY: artek-backend
  EC2_HOST: api.artek-sante.cf

jobs:
  # Tests backend Python
  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: artek_test
        options: >-
          --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping" --health-interval 10s
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      - name: Install dependencies
        run: |
          cd apps/backend
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd apps/backend
          pytest tests/ --cov=app --cov-report=xml --cov-fail-under=85
        env:
          DATABASE_URL: postgresql+asyncpg://postgres:testpass@localhost:5432/artek_test
          REDIS_URL: redis://localhost:6379/0
          JWT_SECRET_KEY: test-secret-key-for-ci-only-32chars
          MEDICAL_ENCRYPTION_KEY: test-encryption-key-32-bytes-long!
      - name: Security scan (Bandit)
        run: |
          cd apps/backend
          bandit -r app/ -f json -o bandit-report.json
      - name: Upload coverage
        uses: codecov/codecov-action@v4

  # Tests frontend
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 8 }
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo lint type-check test

  # Build et déploiement (seulement sur main)
  build-and-deploy:
    needs: [test-backend, test-frontend]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2
      - name: Build and push Docker image
        run: |
          ECR_REGISTRY=${{ steps.login-ecr.outputs.registry }}
          docker build -f infra/docker/backend.Dockerfile \
            -t $ECR_REGISTRY/$ECR_REPOSITORY:$GITHUB_SHA \
            -t $ECR_REGISTRY/$ECR_REPOSITORY:latest \
            apps/backend/
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$GITHUB_SHA
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
      - name: Deploy to EC2
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ env.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_PRIVATE_KEY }}
          script: |
            cd /opt/artek
            docker-compose -f docker-compose.prod.yml pull
            docker-compose -f docker-compose.prod.yml up -d --no-deps api celery
            docker-compose -f docker-compose.prod.yml exec -T api alembic upgrade head
```

---

## 📄 VARIABLES D'ENVIRONNEMENT — `.env.example`

```bash
# ═══════════════════════════════════════════
# ARTEK Connect Santé — Variables d'environnement
# Copier en .env et remplir toutes les valeurs OBLIGATOIRES
# ═══════════════════════════════════════════

# Application
APP_ENV=development  # development | staging | production
DEBUG=true
BASE_URL=http://localhost:8000

# ═══ Base de données PostgreSQL ═══
DB_PASSWORD=changeme_strong_password_here
DATABASE_URL=postgresql+asyncpg://artek:${DB_PASSWORD}@localhost:5432/artek_sante

# ═══ Redis ═══
REDIS_PASSWORD=changeme_redis_password
REDIS_URL=redis://:${REDIS_PASSWORD}@localhost:6379/0

# ═══ MongoDB ═══
MONGO_PASSWORD=changeme_mongo_password
MONGODB_URL=mongodb://artek:${MONGO_PASSWORD}@localhost:27017/artek_sante

# ═══ InfluxDB ═══
INFLUX_PASSWORD=changeme_influx_password
INFLUXDB_TOKEN=changeme_influxdb_token
INFLUXDB_ORG=artek
INFLUXDB_BUCKET=artek_iot

# ═══ JWT Sécurité ═══
# Générer avec: openssl rand -hex 32
JWT_SECRET_KEY=OBLIGATOIRE_generer_openssl_rand_hex_32

# ═══ Chiffrement données médicales AES-256 ═══
# Générer avec: python -c "import secrets; print(secrets.token_hex(32))"
MEDICAL_ENCRYPTION_KEY=OBLIGATOIRE_32_bytes_minimum_en_hex

# ═══ Orange Money ═══
ORANGE_MERCHANT_KEY=votre_merchant_key_orange
ORANGE_PAY_SECRET=votre_secret_orange_pay
# Mode test: https://api.orange.com/orange-money-webpay/dev/v1
# Mode prod: https://api.orange.com/orange-money-webpay/prod/v1
ORANGE_PAY_URL=https://api.orange.com/orange-money-webpay/dev/v1

# ═══ Orange SMS API ═══
ORANGE_SMS_TOKEN=votre_token_sms_orange
ORANGE_SMS_SENDER=ARTEK

# ═══ Daily.co WebRTC ═══
DAILY_API_KEY=votre_api_key_daily_co

# ═══ AWS ═══
AWS_ACCESS_KEY_ID=votre_aws_access_key
AWS_SECRET_ACCESS_KEY=votre_aws_secret_key
AWS_REGION=af-south-1
AWS_S3_BUCKET=artek-medical-images

# ═══ Firebase FCM ═══
# JSON du compte de service Firebase (stringifié)
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"artek-sante",...}

# ═══ Monitoring ═══
SENTRY_DSN=https://xxx@sentry.io/xxx
GRAFANA_PASSWORD=changeme_grafana

# ═══ MQTT Kiosques ═══
MQTT_BROKER=localhost
MQTT_PORT=1883
MQTT_USERNAME=artek-kiosk
MQTT_PASSWORD=changeme_mqtt_password

# ═══ Next.js (Frontend) ═══
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_DAILY_DOMAIN=votre-domaine.daily.co
```

---

## 📜 SCRIPTS D'INSTALLATION — `scripts/`

### `scripts/setup.sh`
```bash
#!/bin/bash
set -euo pipefail

echo "🏥 Installation ARTEK Connect Santé — Environnement de développement"

# Vérifications prérequis
command -v python3.11 >/dev/null || { echo "❌ Python 3.11 requis"; exit 1; }
command -v node >/dev/null || { echo "❌ Node.js 20 requis"; exit 1; }
command -v pnpm >/dev/null || { echo "❌ pnpm requis (npm install -g pnpm)"; exit 1; }
command -v docker >/dev/null || { echo "❌ Docker requis"; exit 1; }

echo "✅ Prérequis OK"

# Copier .env
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Fichier .env créé — REMPLIR LES VALEURS OBLIGATOIRES"
fi

# Backend Python
echo "🐍 Installation backend Python..."
cd apps/backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cd ../..

# Frontend et mobile (pnpm)
echo "📦 Installation packages JS/TS..."
pnpm install

# Démarrer services Docker
echo "🐳 Démarrage services Docker (PostgreSQL, Redis, MongoDB, InfluxDB)..."
docker-compose up -d db redis mongo influxdb mosquitto
sleep 10

# Migrations base de données
echo "🗄️ Application migrations base de données..."
cd apps/backend
source .venv/bin/activate
alembic upgrade head
cd ../..

echo "✅ Installation complète !"
echo ""
echo "Commandes disponibles:"
echo "  make dev       — Démarrer tous les services"
echo "  make test      — Lancer les tests"
echo "  make deploy    — Déployer en production"
echo ""
echo "⚠️  N'oubliez pas de configurer .env avec vos clés API Orange Money et Daily.co"
```

### `scripts/seed-db.sh`
```bash
#!/bin/bash
# Initialisation base de données avec données de test

cd apps/backend
source .venv/bin/activate

python - <<'EOF'
"""Seed base de données ARTEK avec données de test réalistes"""
import asyncio
from app.database import engine, Base
from app.models import *  # Importer tous les modèles
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSession(engine) as session:
        # Créer médecins test
        medecins_test = [
            {"nom": "Dr. Arouna Koyamba", "specialite": "Médecine générale", "prefecture": "Bangui"},
            {"nom": "Dr. Marie-Claire Nzogbo", "specialite": "Pédiatrie", "prefecture": "Bangui"},
            {"nom": "Dr. Emmanuel Banga", "specialite": "Gynécologie", "prefecture": "Bangui"},
        ]
        for m in medecins_test:
            medecin = Medecin(
                id=uuid.uuid4(), telephone=f"7700000{medecins_test.index(m)}",
                nom_chiffre=m["nom"], specialite=m["specialite"],
                prefecture=m["prefecture"], disponible=True
            )
            session.add(medecin)

        # Créer kiosques test
        kiosques_test = [
            {"id": "kiosk-ouham-01", "prefecture": "Ouham", "village": "Batangafo"},
            {"id": "kiosk-nana-01", "prefecture": "Nana-Mambéré", "village": "Bouar"},
        ]
        for k in kiosques_test:
            kiosque = Kiosque(
                id=k["id"], prefecture=k["prefecture"], village=k["village"],
                statut="actif", batterie_pct=85, connexion_ok=True
            )
            session.add(kiosque)

        await session.commit()
        print("✅ Base de données initialisée avec données de test")

asyncio.run(seed())
EOF
```

---

## 📋 TÂCHES CURSOR — ORDRE D'EXÉCUTION RECOMMANDÉ

### Phase 1 — Fondations (Semaine 1)
```
1. Créer la structure complète du monorepo (tous les dossiers et fichiers vides)
2. Configurer docker-compose.yml et vérifier que tous les services démarrent
3. Implémenter app/main.py, config.py, database.py (backend)
4. Créer tous les modèles SQLAlchemy (Patient, Médecin, Consultation, etc.)
5. Générer et appliquer les migrations Alembic
6. Implémenter l'authentification JWT (login, refresh, logout)
7. Tests unitaires auth (couverture 90%+)
```

### Phase 2 — API Cœur (Semaine 2)
```
8.  Router patients (CRUD complet + DMN)
9.  Router médecins (liste, disponibilité, profil)
10. Service Orange Money (initiation paiement, webhook confirmation)
11. Service Orange SMS (envoi OTP, ordonnances)
12. Router consultations (création, statut, historique)
13. WebSocket temps réel (statut consultation, constantes vitales)
14. Tests intégration (mock Orange Money API)
```

### Phase 3 — IA & IoT (Semaine 3)
```
15. Moteur IA (triage symptômes Random Forest)
16. Détection malaria TFLite (endpoint /ia/malaria)
17. Génération ordonnances PDF (WeasyPrint + QR Code)
18. Lecteur BLE Raspberry Pi (ble_reader.py)
19. Sync manager kiosque (offline → online)
20. MQTT publisher (constantes vitales → InfluxDB)
```

### Phase 4 — Frontend (Semaine 4)
```
21. Layout dashboard médecin (Next.js 14)
22. Page consultation vidéo (Daily.co WebRTC)
23. Dossier Médical Numérique (composants patient)
24. App mobile patient (Expo Router, écrans auth)
25. Mode kiosque ASC (écran triage + mesures BLE)
26. Internationalisation FR/Sango (i18next)
```

### Phase 5 — Production (Semaine 5)
```
27. Terraform AWS (EC2, RDS, ElastiCache, S3, CloudFront)
28. CI/CD GitHub Actions (tests + déploiement automatique)
29. Monitoring Grafana/Prometheus (dashboards)
30. Documentation API OpenAPI (swagger auto FastAPI)
31. Tests end-to-end (consultation complète patient → médecin)
32. Audit sécurité (OWASP ZAP + Bandit + Trivy)
```

---

## ⚠️ CONTRAINTES SPÉCIFIQUES RCA — À RESPECTER ABSOLUMENT

```
1. RÉSEAU FAIBLE : Toutes les API doivent répondre en < 2s sur connexion 2G/3G
   → Pagination (max 20 éléments par page), compression gzip, cache Redis

2. OFFLINE-FIRST : L'app mobile doit fonctionner sans connexion
   → SQLite local, queue des actions, sync automatique au retour réseau

3. CHIFFREMENT OBLIGATOIRE : Toutes les données médicales = AES-256-GCM
   → Jamais de données patient en clair en base de données

4. SANGO : Interface disponible en français ET en sango
   → Fichiers i18n/sg/ obligatoires pour tous les écrans patient/ASC

5. USSD : Le paiement Orange Money doit fonctionner via USSD *144# (sans internet)
   → Intégration Orange USSD Gateway en parallèle de l'API REST

6. CONFORMITÉ HL7 FHIR R4 : Toutes les données médicales exportables
   → Endpoint /api/v1/patients/{id}/fhir retournant JSON FHIR valide

7. BATTERIES SOLAIRES : Optimiser la consommation (kiosques = énergie limitée)
   → Mode veille si inactif 10min, shutdown propre si batterie < 15%

8. NUMÉRO ORANGE = IDENTIFIANT : Pas de compte email en RCA rurale
   → Authentification uniquement par numéro Orange + OTP SMS
```

---

## 🧪 COMMANDES UTILES POUR CURSOR

```bash
# Démarrer environnement complet
make dev

# Lancer tous les tests
make test

# Créer nouvelle migration Alembic
cd apps/backend && alembic revision --autogenerate -m "description_migration"

# Appliquer migrations
cd apps/backend && alembic upgrade head

# Voir logs API en temps réel
docker-compose logs -f api

# Ouvrir Swagger UI
open http://localhost:8000/api/docs

# Ouvrir Grafana monitoring
open http://localhost:3001

# Ouvrir Flower (monitoring Celery)
open http://localhost:5555

# Build APK Android (mobile)
cd apps/mobile && eas build --platform android --profile preview

# Entraîner modèle malaria
cd ml && python training/train_malaria.py

# Scanner vulnérabilités
cd apps/backend && bandit -r app/
docker run --rm aquasec/trivy image artek/backend:latest

# Génerer clé JWT sécurisée
openssl rand -hex 32

# Générer clé chiffrement AES-256
python -c "import secrets; print(secrets.token_hex(32))"
```

---

*Document généré pour ARTEK WORLD INNOVATION — Projet ARTEK Connect Santé*
*Version 1.0 — Juin 2026 — Usage exclusif Cursor AI*
