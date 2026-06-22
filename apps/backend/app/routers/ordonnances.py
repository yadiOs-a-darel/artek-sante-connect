import secrets

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user
from app.models.ordonnance import Ordonnance
from app.schemas.ordonnance import (
    OrdonnanceCreate,
    OrdonnanceListResponse,
    OrdonnanceResponse,
    OrdonnanceUpdate,
)

router = APIRouter(prefix="/ordonnances")


@router.get("", response_model=OrdonnanceListResponse)
async def list_ordonnances(
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    query = select(Ordonnance)
    count_query = select(func.count()).select_from(Ordonnance)
    if current["role"] == "patient":
        query = query.where(Ordonnance.patient_id == current["id"])
        count_query = count_query.where(Ordonnance.patient_id == current["id"])
    total = await db.scalar(count_query) or 0
    result = await db.execute(query.order_by(Ordonnance.id.desc()).offset(skip).limit(limit))
    items = result.scalars().all()
    return OrdonnanceListResponse(
        items=[OrdonnanceResponse.model_validate(o) for o in items],
        total=total,
    )


@router.get("/{ordonnance_id}", response_model=OrdonnanceResponse)
async def get_ordonnance(
    ordonnance_id: str,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    result = await db.execute(select(Ordonnance).where(Ordonnance.id == ordonnance_id))
    ordonnance = result.scalar_one_or_none()
    if not ordonnance:
        raise HTTPException(status_code=404, detail="Ordonnance introuvable")
    return OrdonnanceResponse.model_validate(ordonnance)


@router.post("", response_model=OrdonnanceResponse, status_code=201)
async def create_ordonnance(
    data: OrdonnanceCreate,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    medecin_id = current["id"] if current["role"] == "medecin" else None
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
    await db.refresh(ordonnance)
    return OrdonnanceResponse.model_validate(ordonnance)


@router.patch("/{ordonnance_id}", response_model=OrdonnanceResponse)
async def update_ordonnance(
    ordonnance_id: str,
    data: OrdonnanceUpdate,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    result = await db.execute(select(Ordonnance).where(Ordonnance.id == ordonnance_id))
    ordonnance = result.scalar_one_or_none()
    if not ordonnance:
        raise HTTPException(status_code=404, detail="Ordonnance introuvable")

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
    result = await db.execute(select(Ordonnance).where(Ordonnance.id == ordonnance_id))
    ordonnance = result.scalar_one_or_none()
    if not ordonnance:
        raise HTTPException(status_code=404, detail="Ordonnance introuvable")
    await db.delete(ordonnance)
