from fastapi import APIRouter
from app.models.schemas import ChatRequest, ChatResponse
from app.services import translate_service, rag_service, llm_service
from app.database import crud
import uuid

router = APIRouter()


def detect_category(text: str) -> str:
    text = text.lower()
    if any(w in text for w in ["admission", "college", "enroll", "apply", "seat", "merit"]):
        return "admissions"
    elif any(w in text for w in ["scholarship", "fellowship", "stipend", "financial aid"]):
        return "scholarships"
    elif any(w in text for w in ["internship", "intern", "apprentice", "training program", "research fellowship"]):
        return "internships"
    elif any(w in text for w in ["scheme", "yojana", "government", "pm", "pradhan", "central", "state"]):
        return "government"
    elif any(w in text for w in ["certificate", "document", "bonafide", "income", "caste", "migration"]):
        return "certificates"
    elif any(w in text for w in ["nptel", "swayam", "online course", "mooc"]):
        return "nptel"
    else:
        return "general"


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    session_id = request.session_id or str(uuid.uuid4())

    # Step 0: Fetch chat history
    chat_history_rows = crud.get_chat_history(session_id, limit=5)
    past_messages = []
    prev_user_message = ""
    for r in chat_history_rows:
        past_messages.append({"role": "user", "content": r["user_message"]})
        past_messages.append({"role": "assistant", "content": r["bot_reply"]})
        prev_user_message = r["user_message"]

    raw_message = request.message.strip().lower()
    is_followup = raw_message in ["yes", "yeah", "ok", "yep", "sure", "please"]
    query_for_rag = f"{prev_user_message} {request.message}" if (is_followup and prev_user_message) else request.message

    # Step 1: Detect language
    detected_lang = request.language.split("-")[0] if request.language else "en"

    # Step 2: Translate to English (for RAG)
    english_query_for_rag = translate_service.translate_to_english(query_for_rag, detected_lang)
    english_query_actual = translate_service.translate_to_english(request.message, detected_lang)

    # Step 3: Detect category
    category = detect_category(english_query_for_rag)

    # Step 4: RAG retrieval
    context_list, scores, sources = rag_service.retrieve_context(english_query_for_rag)

    # Step 5: Generate LLM response (with optional image)
    final_reply, tavily_sources = llm_service.generate_response(
        user_message=english_query_actual, 
        context_list=context_list, 
        scores=scores, 
        past_messages=past_messages, 
        category=category,
        language=detected_lang,
        image_base64=request.image_base64
    )

    # Step 5.5: Post-process translation for vision responses
    # Vision models tend to respond in English regardless of system prompt language.
    # Apply explicit translation after vision processing to match selected language.
    if request.image_base64 and detected_lang != "en":
        print(f"[CHAT] Translating vision response from English → {detected_lang}")
        final_reply = translate_service.translate_from_english(final_reply, detected_lang)

    # Step 5.6: Resolve Active Sources
    active_sources = tavily_sources if tavily_sources is not None else sources
    real_sources = [s for s in active_sources if isinstance(s, dict) and s.get("url")]

    # Step 6: Save to DB
    crud.save_chat(session_id, request.message, final_reply, detected_lang, category)

    return ChatResponse(
        reply=final_reply,
        session_id=session_id,
        sources=real_sources,
        category=category,
        has_real_sources=len(real_sources) > 0
    )

@router.get("/chats")
def list_chats():
    return crud.get_chat_sessions()

@router.get("/chat/{session_id}")
def get_chat(session_id: str):
    rows = crud.get_chat_history(session_id)
    messages = []
    for r in rows:
        messages.append({"role": "user", "content": r["user_message"], "timestamp": r["timestamp"]})
        messages.append({"role": "assistant", "content": r["bot_reply"], "timestamp": r["timestamp"]})
    return {"chat_id": session_id, "messages": messages}

@router.delete("/chat/{session_id}")
def delete_chat(session_id: str):
    crud.delete_chat_session(session_id)
    return {"status": "success"}
