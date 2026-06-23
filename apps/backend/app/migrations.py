"""Migrations légères au démarrage (sans Alembic)."""

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncConnection


async def run_light_migrations(conn: AsyncConnection) -> None:
    await conn.execute(
        text(
            """
            ALTER TABLE patients
            ADD COLUMN IF NOT EXISTS medecin_id UUID
            REFERENCES medecins(id) ON DELETE SET NULL
            """
        )
    )
    await conn.execute(
        text(
            """
            CREATE INDEX IF NOT EXISTS ix_patients_medecin_id ON patients (medecin_id)
            """
        )
    )
    await conn.execute(
        text(
            """
            UPDATE patients p
            SET medecin_id = sub.medecin_id
            FROM (
                SELECT DISTINCT ON (c.patient_id) c.patient_id, c.medecin_id
                FROM consultations c
                WHERE c.medecin_id IS NOT NULL
                ORDER BY c.patient_id, c.debut_le DESC NULLS LAST
            ) sub
            WHERE p.id = sub.patient_id
              AND p.medecin_id IS NULL
            """
        )
    )

    for col, typedef in (
        ("symptomes", "TEXT"),
        ("reponse_medecin", "TEXT"),
        ("programmee_le", "TIMESTAMP"),
    ):
        await conn.execute(
            text(f"ALTER TABLE consultations ADD COLUMN IF NOT EXISTS {col} {typedef}")
        )

    await conn.execute(
        text(
            "ALTER TABLE mesures_vitales ADD COLUMN IF NOT EXISTS consultation_id UUID"
        )
    )
    await conn.execute(
        text(
            "ALTER TABLE mesures_vitales ADD COLUMN IF NOT EXISTS mesure_le TIMESTAMP"
        )
    )

    for value in ("en_attente_validation", "refusee", "programmee"):
        try:
            await conn.execute(
                text(f"ALTER TYPE statutconsultation ADD VALUE IF NOT EXISTS '{value}'")
            )
        except Exception:
            try:
                await conn.execute(
                    text(f"ALTER TYPE statutconsultation ADD VALUE '{value}'")
                )
            except Exception:
                pass

    # Évite les blocages quand l'enum PostgreSQL n'a pas les nouvelles valeurs
    for ddl in (
        """
        ALTER TABLE consultations
        ALTER COLUMN statut TYPE VARCHAR(40)
        USING statut::text
        """,
        """
        ALTER TABLE consultations
        ALTER COLUMN type_consultation TYPE VARCHAR(20)
        USING type_consultation::text
        """,
    ):
        try:
            await conn.execute(text(ddl))
        except Exception:
            pass
