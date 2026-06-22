from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.active: dict[str, list[WebSocket]] = {}

    async def connect(self, consultation_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active.setdefault(consultation_id, []).append(websocket)

    def disconnect(self, consultation_id: str, websocket: WebSocket):
        if consultation_id in self.active:
            self.active[consultation_id].remove(websocket)

    async def broadcast(self, consultation_id: str, message: dict):
        for ws in self.active.get(consultation_id, []):
            await ws.send_json(message)


manager = ConnectionManager()


@router.websocket("/ws/consultation/{consultation_id}")
async def websocket_consultation(websocket: WebSocket, consultation_id: str):
    await manager.connect(consultation_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            await manager.broadcast(consultation_id, data)
    except WebSocketDisconnect:
        manager.disconnect(consultation_id, websocket)
