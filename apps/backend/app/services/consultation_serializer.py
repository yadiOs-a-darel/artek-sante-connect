"""Sérialisation des consultations."""

from app.models.consultation import Consultation
from app.models.patient import Patient
from app.schemas.consultation import ConsultationResponse


def _enum_val(value) -> str:
    return value.value if hasattr(value, "value") else str(value)


def consultation_to_response(
    consultation: Consultation,
    patient: Patient | None = None,
) -> ConsultationResponse:
    p = patient
    if p is None and getattr(consultation, "patient", None) is not None:
        p = consultation.patient

    return ConsultationResponse(
        id=consultation.id,
        patient_id=consultation.patient_id,
        medecin_id=consultation.medecin_id,
        statut=_enum_val(consultation.statut),
        type_consultation=_enum_val(consultation.type_consultation),
        motif=consultation.motif,
        symptomes=consultation.symptomes,
        reponse_medecin=consultation.reponse_medecin,
        programmee_le=consultation.programmee_le,
        salle_video_url=consultation.salle_video_url,
        debut_le=consultation.debut_le,
        fin_le=consultation.fin_le,
        patient_nom=p.nom_chiffre if p else None,
        patient_prenom=p.prenom_chiffre if p else None,
        patient_telephone=p.telephone if p else None,
    )
