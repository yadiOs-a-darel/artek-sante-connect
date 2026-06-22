from fastapi import APIRouter

router = APIRouter(prefix="/ia")


@router.post("/triage")
async def triage_symptomes():
    return {
        "score": 25,
        "niveau": "vert",
        "recommandation": "conseils_sante",
        "message": "Pas d'urgence — conseils santé suffisants",
    }
