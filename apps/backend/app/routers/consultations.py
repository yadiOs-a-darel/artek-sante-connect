from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user
from app.models.consultation import Consultation, StatutConsultation, TypeConsultation
from app.models.medecin import Medecin
from app.models.paiement import MesureVitale
from app.models.patient import Patient
from app.schemas.consultation import (
    ConsultationCreate,
    ConsultationDemandeCreate,
    ConsultationListResponse,
    ConsultationReponseMedecin,
    ConsultationResponse,
    ConsultationUpdate,
    VideoSessionResponse,
)
from app.schemas.chat import ChatMessageCreate, ChatMessageResponse
from app.services.video_call import prepare_video_session
from app.services.chat import create_chat_message
from app.services.consultation_serializer import consultation_to_response
from app.services.medecin_scope import (
    get_owned_consultation_or_404,
    get_owned_patient_or_404,
    require_medecin,
    scope_consultations_query,
)
from app.services.realtime import ws_manager
from app.models.chat_message import ChatMessage
from app.utils.datetime_rca import assert_future_programmation, to_rca_naive, utc_now_naive

router = APIRouter(prefix="/consultations")


@router.get("", response_model=ConsultationListResponse)
async def list_consultations(
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
    statut: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    if current["role"] not in ("medecin", "patient"):
        raise HTTPException(status_code=403, detail="Accès refusé")

    query = scope_consultations_query(
        select(Consultation, Patient)
        .join(Patient, Consultation.patient_id == Patient.id)
        .order_by(
            Consultation.programmee_le.desc().nullslast(),
            Consultation.debut_le.desc().nullslast(),
        ),
        current,
    )
    count_query = scope_consultations_query(
        select(func.count()).select_from(Consultation), current
    )

    if statut:
        try:
            statut_enum = StatutConsultation(statut)
            query = query.where(Consultation.statut == statut_enum)
            count_query = count_query.where(Consultation.statut == statut_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail="Statut invalide")

    total = await db.scalar(count_query) or 0
    result = await db.execute(query.offset(skip).limit(limit))
    rows = result.all()

    return ConsultationListResponse(
        items=[consultation_to_response(c, p) for c, p in rows],
        total=total,
    )


@router.post("/demande", response_model=ConsultationResponse, status_code=201)
async def creer_demande_consultation(
    data: ConsultationDemandeCreate,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    if current["role"] != "patient":
        raise HTTPException(status_code=403, detail="Réservé aux patients")

    medecin = await db.get(Medecin, data.medecin_id)
    if not medecin or not medecin.est_actif:
        raise HTTPException(status_code=404, detail="Médecin introuvable")

    try:
        type_consultation = TypeConsultation(data.type_consultation)
    except ValueError:
        raise HTTPException(status_code=400, detail="Type de consultation invalide")

    consultation = Consultation(
        patient_id=current["id"],
        medecin_id=data.medecin_id,
        symptomes=data.symptomes,
        motif=data.symptomes[:500],
        type_consultation=type_consultation,
        statut=StatutConsultation.en_attente_validation,
    )
    db.add(consultation)
    await db.flush()

    if data.mesures:
        mesure = MesureVitale(
            patient_id=current["id"],
            consultation_id=consultation.id,
            tension_sys=data.mesures.tension_sys,
            tension_dia=data.mesures.tension_dia,
            spo2=data.mesures.spo2,
            temperature=data.mesures.temperature,
            frequence_cardiaque=data.mesures.frequence_cardiaque,
            source="mobile",
        )
        db.add(mesure)

    await db.flush()
    await db.refresh(consultation)
    patient = await db.get(Patient, current["id"])
    return consultation_to_response(consultation, patient)


@router.get("/{consultation_id}", response_model=ConsultationResponse)
async def get_consultation(
    consultation_id: str,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    consultation = await get_owned_consultation_or_404(consultation_id, db, current)
    patient = await db.get(Patient, consultation.patient_id)
    return consultation_to_response(consultation, patient)


@router.post("", response_model=ConsultationResponse, status_code=201)
async def create_consultation(
    data: ConsultationCreate,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    type_consultation = TypeConsultation.video
    if data.type_consultation:
        try:
            type_consultation = TypeConsultation(data.type_consultation)
        except ValueError:
            raise HTTPException(status_code=400, detail="Type de consultation invalide")

    medecin_id = data.medecin_id
    if current["role"] == "medecin":
        medecin_id = current["id"]
        await get_owned_patient_or_404(str(data.patient_id), db, current)

    consultation = Consultation(
        patient_id=data.patient_id,
        medecin_id=medecin_id,
        motif=data.motif,
        type_consultation=type_consultation,
        statut=StatutConsultation.en_attente,
    )
    db.add(consultation)
    await db.flush()
    await db.refresh(consultation)
    patient = await db.get(Patient, consultation.patient_id)
    return consultation_to_response(consultation, patient)


@router.get("/{consultation_id}/video", response_model=VideoSessionResponse)
async def get_video_session(
    consultation_id: str,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    consultation = await get_owned_consultation_or_404(consultation_id, db, current)

    if consultation.statut in (
        StatutConsultation.en_attente_validation,
        StatutConsultation.refusee,
    ):
        raise HTTPException(
            status_code=403,
            detail="La consultation n'est pas encore validée par le médecin",
        )

    role = current["role"]
    user = current["user"]

    if role == "medecin":
        user_name = getattr(user, "nom_chiffre", None) or "Médecin"
        is_owner = True
    elif role == "patient":
        user_name = f"Patient {getattr(user, 'telephone', '')[-4:]}"
        is_owner = False
    else:
        raise HTTPException(status_code=403, detail="Rôle non autorisé")

    session = await prepare_video_session(
        consultation,
        db,
        user_name=user_name,
        is_owner=is_owner,
    )
    return VideoSessionResponse(**session)


@router.get("/{consultation_id}/messages", response_model=list[ChatMessageResponse])
async def list_chat_messages(
    consultation_id: str,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    consultation = await get_owned_consultation_or_404(consultation_id, db, current)

    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.consultation_id == consultation_id)
        .order_by(ChatMessage.envoye_le.asc())
    )
    messages = result.scalars().all()
    return [ChatMessageResponse.model_validate(m) for m in messages]


@router.post(
    "/{consultation_id}/messages",
    response_model=ChatMessageResponse,
    status_code=201,
)
async def send_chat_message(
    consultation_id: str,
    data: ChatMessageCreate,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    consultation = await get_owned_consultation_or_404(consultation_id, db, current)

    message = await create_chat_message(consultation, db, current, data.contenu)
    response = ChatMessageResponse.model_validate(message)

    await ws_manager.broadcast(
        consultation_id,
        {"type": "chat", "payload": response.model_dump(mode="json")},
    )

    return response


@router.patch("/{consultation_id}/repondre", response_model=ConsultationResponse)
async def repondre_demande_consultation(
    consultation_id: str,
    data: ConsultationReponseMedecin,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    require_medecin(current)
    consultation = await get_owned_consultation_or_404(consultation_id, db, current)

    if consultation.statut != StatutConsultation.en_attente_validation:
        raise HTTPException(
            status_code=400,
            detail="Cette demande n'est plus en attente de validation",
        )

    consultation.reponse_medecin = data.reponse_medecin.strip()

    if data.action == "refuser":
        consultation.statut = StatutConsultation.refusee
    else:
        programmee = data.programmee_le or (utc_now_naive() + timedelta(hours=1))
        assert_future_programmation(programmee)
        consultation.statut = StatutConsultation.programmee
        consultation.programmee_le = to_rca_naive(programmee)
        medecin = current["user"]
        user_name = getattr(medecin, "nom_chiffre", None) or "Médecin"
        await prepare_video_session(
            consultation,
            db,
            user_name=user_name,
            is_owner=True,
        )

    await db.flush()
    await db.refresh(consultation)
    patient = await db.get(Patient, consultation.patient_id)
    return consultation_to_response(consultation, patient)


@router.patch("/{consultation_id}/demarrer", response_model=ConsultationResponse)
async def demarrer_consultation(
    consultation_id: str,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    from datetime import datetime

    consultation = await get_owned_consultation_or_404(consultation_id, db, current)

    consultation.statut = StatutConsultation.en_cours
    consultation.debut_le = datetime.utcnow()
    await db.flush()
    await db.refresh(consultation)
    patient = await db.get(Patient, consultation.patient_id)
    return consultation_to_response(consultation, patient)


@router.patch("/{consultation_id}", response_model=ConsultationResponse)
async def update_consultation(
    consultation_id: str,
    data: ConsultationUpdate,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    consultation = await get_owned_consultation_or_404(consultation_id, db, current)

    if data.motif is not None:
        consultation.motif = data.motif
    if data.diagnostic is not None:
        consultation.diagnostic = data.diagnostic
    if data.statut is not None:
        try:
            consultation.statut = StatutConsultation(data.statut)
        except ValueError:
            raise HTTPException(status_code=400, detail="Statut invalide")
    if data.type_consultation is not None:
        try:
            consultation.type_consultation = TypeConsultation(data.type_consultation)
        except ValueError:
            raise HTTPException(status_code=400, detail="Type invalide")
    if data.reponse_medecin is not None:
        consultation.reponse_medecin = data.reponse_medecin
    if data.programmee_le is not None:
        consultation.programmee_le = data.programmee_le

    await db.flush()
    await db.refresh(consultation)
    patient = await db.get(Patient, consultation.patient_id)
    return consultation_to_response(consultation, patient)


@router.delete("/{consultation_id}", status_code=204)
async def delete_consultation(
    consultation_id: str,
    db: AsyncSession = Depends(get_db),
    current=Depends(get_current_user),
):
    consultation = await get_owned_consultation_or_404(consultation_id, db, current)
    await db.delete(consultation)
