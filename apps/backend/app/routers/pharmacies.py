from fastapi import APIRouter

router = APIRouter(prefix="/pharmacies")


@router.get("")
async def list_pharmacies():
    return {"items": [], "total": 0}
