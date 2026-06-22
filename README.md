# ARTEK Connect Santé

Plateforme intégrée de télémédecine solaire pour la République Centrafricaine (RCA).

## Architecture

Monorepo **pnpm + Turborepo** :

| Application | Stack |
|-------------|-------|
| `apps/backend` | FastAPI, PostgreSQL, Redis, Celery |
| `apps/web` | **Vite + React + TanStack Router** (remplace Next.js App Router) |
| `apps/mobile` | React Native + Expo (à compléter) |
| `packages/*` | Types, UI, utilitaires partagés |

## Prérequis

- **Python 3.11 ou 3.12** (⚠️ Python 3.14 n'est pas encore supporté par pydantic/asyncpg)
- Node.js 20+
- Docker

Sur Ubuntu/Debian :
```bash
sudo apt install python3.12 python3.12-venv
```

## Démarrage rapide

```bash
# Installation complète
chmod +x scripts/*.sh
./scripts/setup.sh

# Ou manuellement :
cp .env.example .env
cd apps/backend
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cd ../.. && npx pnpm@8.15.0 install
docker compose up -d db redis
```

### Lancer en développement

```bash
# Terminal 1 — API
cd apps/backend && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend (TanStack Router)
cd apps/web && pnpm dev

# Terminal 3 — Mobile (Expo)
cd apps/mobile && pnpm start
```

- **Frontend** : http://localhost:3000
- **API Swagger** : http://localhost:8000/api/docs
- **Health** : http://localhost:8000/health
- **Mobile** : Expo Go — voir `apps/mobile/README.md`

## Frontend — TanStack Router

Le frontend utilise **Vite + TanStack Router** au lieu de Next.js App Router :

```
apps/web/src/routes/
├── __root.tsx
├── index.tsx              # Landing page
├── login.tsx
├── dashboard.tsx          # Layout protégé
├── dashboard/
│   ├── accueil.tsx
│   ├── patients/
│   │   ├── index.tsx
│   │   └── $id.tsx
│   └── consultation/
│       └── $id.tsx
└── admin/
    └── kiosques.tsx
```

Variables d'environnement (`.env` à la racine du monorepo) :

```bash
VITE_API_URL=http://localhost:8000
EXPO_PUBLIC_API_URL=http://localhost:8000

# Backend (même fichier .env)
GOOGLE_MEET_DEV_URL=https://meet.google.com/votre-code-reunion
```

### Activer la visioconférence (Google Meet)

**Développement rapide**
1. Créez une réunion sur [meet.google.com](https://meet.google.com)
2. Copiez le lien dans `GOOGLE_MEET_DEV_URL` du fichier `.env`
3. Redémarrez le backend, ouvrez une consultation → **Rejoindre Google Meet**

**Production**
1. Créez un projet [Google Cloud](https://console.cloud.google.com)
2. Activez l’API **Google Calendar**
3. Créez un compte de service et téléchargez le JSON → `GOOGLE_SERVICE_ACCOUNT_JSON`
4. Optionnel : `GOOGLE_CALENDAR_IMPERSONATE` pour un compte Google Workspace médecin
5. Chaque consultation génère automatiquement un lien Meet unique

## Structure

```
artek-connect-sante/
├── apps/
│   ├── backend/     # API FastAPI
│   ├── web/         # Dashboard médecin (Vite + TanStack Router)
│   └── mobile/      # App patients (Expo)
├── packages/
│   ├── types/
│   ├── ui/
│   └── shared-utils/
├── infra/docker/
├── iot/
├── ml/
└── scripts/
```

## Tests

```bash
# Backend
cd apps/backend && pytest tests/

# Frontend
pnpm turbo type-check
```

## Licence

Projet ARTEK — République Centrafricaine
# artek-sante-connect
