from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ChatRequest(BaseModel):
    message: str
    language: Optional[str] = "en"
    session_id: Optional[str] = None
    image_base64: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    session_id: str
    sources: Optional[List[dict]] = []
    category: Optional[str] = None
    has_real_sources: Optional[bool] = False

class FAQCreate(BaseModel):
    question: str
    answer: str
    category: str
    language: Optional[str] = "en"

class FAQUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    category: Optional[str] = None

class FAQResponse(BaseModel):
    id: int
    question: str
    answer: str
    category: str
    language: str
    created_at: str

class ChatHistoryItem(BaseModel):
    id: int
    session_id: str
    user_message: str
    bot_reply: str
    language: str
    timestamp: str


# ── New Models ─────────────────────────────────────────────────────────────────

class InternshipResponse(BaseModel):
    id: int
    title: str
    organization: str
    domain: str
    duration: Optional[str] = None
    stipend: Optional[str] = None
    eligibility: Optional[str] = None
    states: Optional[str] = "All India"
    apply_link: Optional[str] = None
    deadline: Optional[str] = None
    type: Optional[str] = "government"

class StateSchemeResponse(BaseModel):
    id: int
    name: str
    state: str
    department: Optional[str] = None
    category: Optional[str] = None
    eligibility: Optional[str] = None
    benefit: Optional[str] = None
    apply_link: Optional[str] = None
    deadline: Optional[str] = None
    documents: Optional[str] = None

class NPTELCourseResult(BaseModel):
    title: str
    url: str
    snippet: Optional[str] = None
    source: Optional[str] = None
