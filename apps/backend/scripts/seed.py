"""Création / mise à jour des données de test ARTEK."""
import asyncio
import sys
from datetime import datetime, timedelta

import bcrypt
from sqlalchemy import select

from app.database import AsyncSessionLocal, Base, engine
from app.models.consultation import Consultation, StatutConsultation, TypeConsultation
from app.models.medecin import Medecin
from app.models.paiement import Kiosque
from app.models.patient import Patient

MEDECINS_TEST = [
    {
        "telephone": "72847859",
        "nom": "Dr. ARTEK Test",
        "specialite": "Médecine générale",
        "prefecture": "Bangui",
        "pin": "root1234",
    },
]

PATIENTS_TEST = [
    {
        "telephone": "72000001",
        "nom": "Koyamba",
        "prenom": "Jean",
        "prefecture": "Bangui",
        "village": "PK5",
    },
    {
        "telephone": "72000002",
        "nom": "Nzogbo",
        "prenom": "Marie",
        "prefecture": "Ouham",
        "village": "Batangafo",
    },
    {
        "telephone": "72000003",
        "nom": "Banga",
        "prenom": "Emmanuel",
        "prefecture": "Bangui",
        "village": "Bimbo",
    },
]

# Anciens numéros de test (préfixe Nationlink 77) → Orange 72
LEGACY_PATIENT_PHONES = {
    "77000001": "72000001",
    "77000002": "72000002",
    "77000003": "72000003",
}

KIOSQUES_TEST = [
    {"id": "kiosk-ouham-01", "prefecture": "Ouham", "village": "Batangafo"},
    {"id": "kiosk-bangui-01", "prefecture": "Bangui", "village": "PK12"},
]


def hash_pin(pin: str) -> str:
    return bcrypt.hashpw(pin.encode(), bcrypt.gensalt()).decode()


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        medecin = None
        for data in MEDECINS_TEST:
            result = await session.execute(
                select(Medecin).where(Medecin.telephone == data["telephone"])
            )
            medecin = result.scalar_one_or_none()

            if medecin:
                medecin.nom_chiffre = data["nom"]
                medecin.specialite = data["specialite"]
                medecin.prefecture = data["prefecture"]
                medecin.pin_hash = hash_pin(data["pin"])
                medecin.disponible = True
                medecin.est_actif = True
                print(f"✅ Médecin mis à jour : +236 {data['telephone']}")
            else:
                medecin = Medecin(
                    telephone=data["telephone"],
                    nom_chiffre=data["nom"],
                    specialite=data["specialite"],
                    prefecture=data["prefecture"],
                    pin_hash=hash_pin(data["pin"]),
                    disponible=True,
                    est_actif=True,
                )
                session.add(medecin)
                print(f"✅ Médecin créé : +236 {data['telephone']}")

        await session.flush()

        for old_phone, new_phone in LEGACY_PATIENT_PHONES.items():
            result = await session.execute(
                select(Patient).where(Patient.telephone == old_phone)
            )
            legacy = result.scalar_one_or_none()
            if legacy:
                legacy.telephone = new_phone
                print(f"ℹ️  Patient migré : {old_phone} → {new_phone}")

        patients = []
        for data in PATIENTS_TEST:
            result = await session.execute(
                select(Patient).where(Patient.telephone == data["telephone"])
            )
            patient = result.scalar_one_or_none()
            if not patient:
                patient = Patient(
                    medecin_id=medecin.id if medecin else None,
                    telephone=data["telephone"],
                    nom_chiffre=data["nom"],
                    prenom_chiffre=data["prenom"],
                    prefecture=data["prefecture"],
                    village=data.get("village"),
                    consentement=True,
                )
                session.add(patient)
                print(f"✅ Patient créé : +236 {data['telephone']}")
            else:
                if medecin and not patient.medecin_id:
                    patient.medecin_id = medecin.id
                print(f"ℹ️  Patient existant : +236 {data['telephone']}")
            patients.append(patient)

        await session.flush()

        if medecin and patients:
            existing = await session.scalar(select(Consultation).limit(1))
            if not existing:
                now = datetime.utcnow()
                consultations = [
                    Consultation(
                        patient_id=patients[0].id,
                        medecin_id=medecin.id,
                        type_consultation=TypeConsultation.video,
                        statut=StatutConsultation.en_attente,
                        motif="Fièvre et maux de tête",
                    ),
                    Consultation(
                        patient_id=patients[1].id,
                        medecin_id=medecin.id,
                        type_consultation=TypeConsultation.video,
                        statut=StatutConsultation.en_cours,
                        motif="Suivi grossesse",
                        debut_le=now - timedelta(minutes=15),
                    ),
                    Consultation(
                        patient_id=patients[2].id,
                        medecin_id=medecin.id,
                        type_consultation=TypeConsultation.audio,
                        statut=StatutConsultation.terminee,
                        motif="Renouvellement ordonnance",
                        debut_le=now - timedelta(days=1),
                        fin_le=now - timedelta(days=1) + timedelta(minutes=20),
                    ),
                ]
                session.add_all(consultations)
                print(f"✅ {len(consultations)} consultations de démo créées")

        for data in KIOSQUES_TEST:
            result = await session.execute(
                select(Kiosque).where(Kiosque.id == data["id"])
            )
            if not result.scalar_one_or_none():
                session.add(
                    Kiosque(
                        id=data["id"],
                        prefecture=data["prefecture"],
                        village=data["village"],
                        statut="actif",
                        batterie_pct=85,
                        connexion_ok=1,
                    )
                )
                print(f"✅ Kiosque créé : {data['id']}")

        await session.commit()

    print("\nConnexion web : http://localhost:3000/login")
    print("  Téléphone : 72847859")
    print("  Mot de passe : root1234")


if __name__ == "__main__":
    try:
        asyncio.run(seed())
    except Exception as exc:
        print(f"❌ Erreur : {exc}", file=sys.stderr)
        sys.exit(1)
