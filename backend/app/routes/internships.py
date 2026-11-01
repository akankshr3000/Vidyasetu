from fastapi import APIRouter, Query
from app.database.crud import get_all_internships, search_internships, get_internship_by_id
from typing import Optional

router = APIRouter()

@router.get("/internships")
def list_internships(
    state: Optional[str] = Query(None),
    domain: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    """Get internships with optional filters."""
    if search:
        return search_internships(search)
    return get_all_internships(state=state, domain=domain, type_filter=type)

@router.get("/internships/{internship_id}")
def get_internship(internship_id: int):
    i = get_internship_by_id(internship_id)
    if not i:
        return {"error": "Not found"}
    return i
