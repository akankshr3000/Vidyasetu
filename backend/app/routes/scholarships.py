from fastapi import APIRouter, Query
from app.database.crud import get_all_scholarships, search_scholarships, get_scholarship_by_id
from typing import Optional

router = APIRouter()

@router.get("/scholarships")
def list_scholarships(
    state: Optional[str] = Query(None),
    level: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    """Get scholarships with optional filters."""
    if search:
        return search_scholarships(search)
    return get_all_scholarships(state=state, level=level, category=category)

@router.get("/scholarships/{scholarship_id}")
def get_scholarship(scholarship_id: int):
    s = get_scholarship_by_id(scholarship_id)
    if not s:
        return {"error": "Not found"}
    return s
