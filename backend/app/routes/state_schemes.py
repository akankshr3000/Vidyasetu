from fastapi import APIRouter, Query
from app.database.crud import get_all_state_schemes, search_state_schemes, get_state_scheme_by_id
from app.services.llm_service import tavily
from typing import Optional

router = APIRouter()

@router.get("/state-schemes")
def list_state_schemes(
    state: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    """Get state government schemes with optional filters."""
    if search:
        return search_state_schemes(search)
    return get_all_state_schemes(state=state, category=category)

@router.get("/state-schemes/{scheme_id}")
def get_state_scheme(scheme_id: int):
    s = get_state_scheme_by_id(scheme_id)
    if not s:
        return {"error": "Not found"}
    return s

@router.get("/state-schemes/{scheme_id}/live-update")
def get_live_update(scheme_id: int):
    """Fetch latest info about a state scheme using Tavily."""
    scheme = get_state_scheme_by_id(scheme_id)
    if not scheme:
        return {"error": "Scheme not found"}

    if not tavily:
        return {"error": "Tavily API not configured", "results": []}

    try:
        query = f"{scheme['name']} {scheme['state']} scheme latest update 2025 2026"
        result = tavily.search(query=query, max_results=3)

        updates = []
        for r in result.get("results", []):
            updates.append({
                "title": r.get("title", ""),
                "url": r.get("url", ""),
                "snippet": r.get("content", "")[:300],
            })

        return {
            "scheme_id": scheme_id,
            "scheme_name": scheme["name"],
            "updates": updates,
            "count": len(updates)
        }

    except Exception as e:
        print(f"[STATE-SCHEMES] Tavily error: {e}")
        return {"error": str(e), "updates": [], "count": 0}
