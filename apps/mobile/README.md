# ARTEK Connect Santé — Mobile (Expo)

Application React Native **Expo SDK 54** + **Expo Router** pour les patients et le mode kiosque ASC.

## Démarrage

```bash
# Depuis la racine du monorepo
pnpm install

# .env à la racine :
# EXPO_PUBLIC_API_URL=http://192.168.0.103:8000  (IP LAN du PC)

cd apps/mobile
pnpm start:lan -- -c
```

Scannez le QR code avec **Expo Go** (SDK 54+). PC et téléphone sur le **même Wi‑Fi**.

`start:lan` active `EXPO_OFFLINE=1` pour éviter l'erreur `TypeError: fetch failed` quand Expo ne peut pas joindre expo.dev (pas d'Internet ou pare-feu). Le bundler LAN fonctionne normalement.

Si le téléphone ne se connecte pas au QR LAN : `pnpm start:tunnel -- -c` (nécessite Internet).

> `pnpm start:offline -- -c` : mode localhost uniquement (sans `--lan`).

## Structure

```
app/
├── (auth)/          # Bienvenue, téléphone, OTP
├── (patient)/       # Tabs : accueil, consultations, dossier, profil
└── (kiosque)/       # Parcours ASC : identification → triage → mesures → consultation
```

## Connexion test (patient)

Après `./scripts/seed-db.sh` :

| Champ | Valeur |
|-------|--------|
| Téléphone | `72000001` |
| OTP (dev) | `000000` |

## API mobile

- `POST /api/v1/auth/otp/request` — demande OTP
- `POST /api/v1/auth/login/patient` — connexion patient
- `GET /api/v1/patients/me` — profil
- `GET /api/v1/patients/me/consultations` — historique
- `POST /api/v1/kiosques/start-consultation` — création depuis kiosque (dev)

## Packages partagés

- `@artek/types`
- `@artek/shared-utils`
