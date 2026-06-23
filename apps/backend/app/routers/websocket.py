from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.realtime import ws_manager

router = APIRouter()


@router.websocket("/ws/consultation/{consultation_id}")
async def websocket_consultation(websocket: WebSocket, consultation_id: str):
    await ws_manager.connect(consultation_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            await ws_manager.broadcast(consultation_id, data)
    except WebSocketDisconnect:
        ws_manager.disconnect(consultation_id, websocket)
