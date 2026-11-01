from fastapi import APIRouter, Query
from app.services.llm_service import tavily
from typing import Optional

router = APIRouter()

@router.get("/nptel")
def search_nptel_courses(query: Optional[str] = Query("computer science")):
    """Search NPTEL courses using Tavily web search."""
    if not tavily:
        return {"error": "Tavily API not configured", "results": []}

    try:
        search_query = f"NPTEL courses {query} site:nptel.ac.in OR site:swayam.gov.in"
        result = tavily.search(query=search_query, max_results=8)

        courses = []
        for r in result.get("results", []):
            title = r.get("title", "").strip()
            url = r.get("url", "").strip()
            snippet = r.get("content", "").strip()
            source = "NPTEL" if "nptel" in url.lower() else "SWAYAM" if "swayam" in url.lower() else "Other"

            if title and url:
                courses.append({
                    "title": title,
                    "url": url,
                    "snippet": snippet[:300] if snippet else "",
                    "source": source,
                })

        return {"query": query, "results": courses, "count": len(courses)}

    except Exception as e:
        print(f"[NPTEL] Tavily search error: {e}")
        return {"error": str(e), "results": [], "count": 0}
