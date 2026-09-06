from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json

from . import models
from .database import engine, get_db, SessionLocal
from .connection_manager import manager

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Real-Time Chat API is running"}

@app.get("/chat/history/{room_id}")
def get_chat_history(room_id: str, db: Session = Depends(get_db)):
    messages = db.query(models.Message).filter(models.Message.room_id == room_id).order_by(models.Message.created_at.asc()).all()
    return [
        {
            "id": msg.id,
            "sender": msg.sender,
            "content": msg.content,
            "created_at": msg.created_at.isoformat() if msg.created_at else None
        } for msg in messages
    ]

@app.websocket("/ws/chat/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await manager.connect(websocket, room_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Expecting JSON: {"sender": "User1", "content": "Hello"}
            try:
                payload = json.loads(data)
                sender = payload.get("sender", "Anonymous")
                content = payload.get("content", "")
                
                # Using discrete session as recommended for WebSocket lifecycle
                with SessionLocal() as session:
                    db_message = models.Message(room_id=room_id, sender=sender, content=content)
                    session.add(db_message)
                    session.commit()
                    session.refresh(db_message)
                    
                    broadcast_payload = {
                        "id": db_message.id,
                        "sender": db_message.sender,
                        "content": db_message.content,
                        "created_at": db_message.created_at.isoformat() if db_message.created_at else None,
                        "room_id": room_id
                    }
                
                await manager.broadcast(json.dumps(broadcast_payload), room_id)
            except json.JSONDecodeError:
                pass # Ignore invalid JSON
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
