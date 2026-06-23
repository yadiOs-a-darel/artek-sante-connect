from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active: dict[str, list[WebSocket]] = {}

    async def connect(self, consultation_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active.setdefault(consultation_id, []).append(websocket)

    def disconnect(self, consultation_id: str, websocket: WebSocket):
        if consultation_id in self.active:
            try:
                self.active[consultation_id].remove(websocket)
            except ValueError:
                pass
            if not self.active[consultation_id]:
                del self.active[consultation_id]

    async def broadcast(self, consultation_id: str, message: dict):
        dead: list[WebSocket] = []
        for ws in self.active.get(consultation_id, []):
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(consultation_id, ws)


ws_manager = ConnectionManager()
