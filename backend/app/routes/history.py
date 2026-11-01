from fastapi import APIRouter
from app.database import crud

router = APIRouter()

@router.get("/history/{session_id}")
def get_history(session_id: str):
    return crud.get_chat_history(session_id)
