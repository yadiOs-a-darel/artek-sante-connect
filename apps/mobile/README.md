# ARTEK Connect Santé — Mobile (Expo)

Application React Native **Expo SDK 54** + **Expo Router** pour les patients et le mode kiosque ASC.

## Démarrage

```bash
# Depuis la racine du monorepo
pnpm install

# Ajouter dans .env à la racine :
# EXPO_PUBLIC_API_URL=http://localhost:8000
# Sur appareil physique : utilisez l'IP LAN de votre PC (ex. http://192.168.1.10:8000)

cd apps/mobile
pnpm start
```

Scannez le QR code avec **Expo Go** (SDK 54+) ou lancez un émulateur (`a` / `i`).

> Si vous voyez une erreur de version Expo Go, relancez avec cache vidé : `pnpm start -- -c`

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
| Téléphone | `77000001` |
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
