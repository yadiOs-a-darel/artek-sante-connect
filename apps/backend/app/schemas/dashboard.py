from pydantic import BaseModel


class DashboardStats(BaseModel):
    consultations_aujourdhui: int
    patients_actifs: int
    rendez_vous_en_attente: int
    kiosques_actifs: int
    ordonnances_mois: int
