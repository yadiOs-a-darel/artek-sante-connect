from fastapi import APIRouter

router = APIRouter(prefix="/paiements")


@router.post("/initier")
async def initier_paiement():
    return {"message": "Paiement Orange Money — à implémenter"}


@router.post("/webhook/orange-money")
async def webhook_orange_money():
    return {"status": "ok"}
