import secrets

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user
from app.models.medecin import Medecin
from app.models.ordonnance import Ordonnance
from app.models.patient import Patient
from app.schemas.ordonnance import (
    OrdonnanceCreate,
    OrdonnanceListResponse,
    OrdonnanceResponse,
    OrdonnanceUpdate,
    OrdonnanceVerifyResponse,
)
from app.services.medecin_scope import (
    get_owned_consultation_or_404,
    get_owned_patient_or_404,
    scope_ordonnances_query,
)
from app.services.ordonnance_notify import send_ordonnance_sms
from app.services.ordonnance_service import (
    _format_medicaments,
    generate_ordonnance_pdf,
    generate_qr_png_for_ordonnance,
    pdf_url_for_ordonnance,
)

router = APIRouter(prefix="/ordonnances")


async def _get_owned_ordonnance_or_404(
    ordonnance_id: str, db: AsyncSession, current: dict
) -> Ordonnance:
    result = await db.execute(select(Ordonnance).where(Ordonnance.id == ordonnance_id))
    ordonnance = result.scalar_one_or_none()
    if not ordonnance:
        raise HTTPException(status_code=404, detail="Ordonnance introuvable")

    if current["role"] == "medecin":
        if not ordonnance.medecin_id or str(ordonnance.medecin_id) != str(current["id"]):
            raise HTTPException(status_code=404, detail="Ordonnance introuvable")
    elif current["role"] == "patient":
        if str(ordonnance.patient_id) != str(current["id"]):
            raise HTTPException(status_code=404, detail="Ordonnance introuvable")
    else:
        raise HTTPException(status_code=403, detail="Accès refusé")

    return ordonnance


def _patient_label(patient: Patient | None) -> str:
    if not patient:
        return "Patient"
    parts = [patient.prenom_chiffre or "", patient.nom_chiffre or ""]
    name = " ".join(p for p in parts if p).strip()
    if name:
        return name
    return f"+236 {patient.telephone}"


def _patient_initiales(patient: Patient | None) -> str:
    if not patient:
        return "??"
    p = (patient.prenom_chiffre or "?")[:1].upper()
    n = (patient.nom_chiffre or "?")[:1].upper()
    return f"{p}.{n}."


async def _ordonnance_pdf_bytes(ordonnance: Ordonnance, db: AsyncSession) -> bytes:
    patient = await db.get(Patient, ordonnance.patient_id)
    medecin = await db.get(Medecin, ordonnance.medecin_id) if ordonnance.medecin_id else None
    medecin_label = getattr(medecin, "nom_chiffre", None) or "Médecin ARTEK"
    return generate_ordonnance_pdf(
        qr_code=ordonnance.qr_code or "",
        medicaments=list(ordonnance.medicaments or []),
        patient_label=_patient_label(patient),
        medecin_label=medecin_label,
        ordonnance_id=str(ordonnance.id),
    )


@router.get("/verify/{qr_code}", response_model=OrdonnanceVerifyResponse)
async def verify_ordonnance(qr_code: str, db: AsyncSession = Depends(get_db)):
    """Vérification publique en pharmacie (scan du QR code)."""
    code = qr_code.strip().upper()
    result = await db.execute(select(Ordonnance).where(Ordonnance.qr_code == code))
    ordonnance = result.scalar_one_or_none()
    if not ordonnance:
        return OrdonnanceVerifyResponse(
            valide=False,
            qr_code=code,
            medicaments=[],
            message="Code inconnu ou ordonnance introuvable.",
        )

    patient = await db.get(Patient, ordonnance.patient_id)
    medecin = await db.get(Medecin, ordonnance.medecin_id) if ordonnance.medecin_id else None
    meds, instructions = _format_medicaments(list(ordonnance.medicaments or []))

    return OrdonnanceVerifyResponse(
        valide=True,
        qr_code=code,
        medecin_nom=getattr(medecin, "nom_chiffre", None),
        patient_initiales=_patient_initiales(patient),
        medicaments=meds,
        instructions=instructions or None,
        message="Ordonnance valide — délivrance autorisée selon protocole local.",
    )


@router.get("", response_model=OrdonnanceListResponse)
async def list_ordonnances(
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    query = scope_ordonnances_query(select(Ordonnance), current)
    count_query = scope_ordonnances_query(
        select(func.count()).select_from(Ordonnance), current
    )
    total = await db.scalar(count_query) or 0
    result = await db.execute(query.order_by(Ordonnance.id.desc()).offset(skip).limit(limit))
    items = result.scalars().all()
    return OrdonnanceListResponse(
        items=[OrdonnanceResponse.model_validate(o) for o in items],
        total=total,
    )


@router.get("/{ordonnance_id}/pdf")
async def download_ordonnance_pdf(
    ordonnance_id: str,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    ordonnance = await _get_owned_ordonnance_or_404(ordonnance_id, db, current)
    try:
        pdf_bytes = await _ordonnance_pdf_bytes(ordonnance, db)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="ordonnance-{ordonnance.qr_code}.pdf"'
        },
    )


@router.get("/{ordonnance_id}/qr")
async def download_ordonnance_qr(
    ordonnance_id: str,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    ordonnance = await _get_owned_ordonnance_or_404(ordonnance_id, db, current)
    if not ordonnance.qr_code:
        raise HTTPException(status_code=404, detail="QR code absent")
    png = generate_qr_png_for_ordonnance(ordonnance.qr_code)
    return Response(content=png, media_type="image/png")


@router.get("/{ordonnance_id}", response_model=OrdonnanceResponse)
async def get_ordonnance(
    ordonnance_id: str,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    ordonnance = await _get_owned_ordonnance_or_404(ordonnance_id, db, current)
    return OrdonnanceResponse.model_validate(ordonnance)


@router.post("", response_model=OrdonnanceResponse, status_code=201)
async def create_ordonnance(
    data: OrdonnanceCreate,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    if current["role"] != "medecin":
        raise HTTPException(status_code=403, detail="Réservé aux médecins")

    medecin_id = current["id"]
    patient = await get_owned_patient_or_404(str(data.patient_id), db, current)
    if data.consultation_id:
        await get_owned_consultation_or_404(str(data.consultation_id), db, current)

    medicaments = [m.model_dump() for m in data.medicaments]
    if data.instructions:
        medicaments.append({"instructions": data.instructions})

    ordonnance = Ordonnance(
        consultation_id=data.consultation_id,
        patient_id=data.patient_id,
        medecin_id=medecin_id,
        medicaments=medicaments,
        qr_code=f"ARTEK-{secrets.token_hex(8).upper()}",
    )
    db.add(ordonnance)
    await db.flush()
    ordonnance.pdf_url = pdf_url_for_ordonnance(str(ordonnance.id))
    await db.flush()
    await db.refresh(ordonnance)

    await send_ordonnance_sms(patient.telephone, ordonnance.qr_code)

    return OrdonnanceResponse.model_validate(ordonnance)


@router.patch("/{ordonnance_id}", response_model=OrdonnanceResponse)
async def update_ordonnance(
    ordonnance_id: str,
    data: OrdonnanceUpdate,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    if current["role"] != "medecin":
        raise HTTPException(status_code=403, detail="Réservé aux médecins")

    ordonnance = await _get_owned_ordonnance_or_404(ordonnance_id, db, current)

    if data.medicaments is not None:
        meds = [m.model_dump() for m in data.medicaments]
        if data.instructions:
            meds.append({"instructions": data.instructions})
        ordonnance.medicaments = meds
    elif data.instructions is not None:
        ordonnance.medicaments = list(ordonnance.medicaments or []) + [
            {"instructions": data.instructions}
        ]

    await db.flush()
    await db.refresh(ordonnance)
    return OrdonnanceResponse.model_validate(ordonnance)


@router.delete("/{ordonnance_id}", status_code=204)
async def delete_ordonnance(
    ordonnance_id: str,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    ordonnance = await _get_owned_ordonnance_or_404(ordonnance_id, db, current)
    await db.delete(ordonnance)
