import os
from dotenv import load_dotenv
from groq import Groq
from tavily import TavilyClient

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY", "").strip())

try:
    tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY", "").strip())
except Exception:
    tavily = None

# Vision-capable model on Groq
VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"
TEXT_MODEL = "llama-3.1-8b-instant"

def search_web(query):
    if not tavily: 
        return "", []
    try:
        result = tavily.search(query=query, max_results=3)
        content = ""
        sources = []
        for r in result.get("results", []):
            content += r.get("content", "") + "\n"
            url = r.get("url", "")
            if url:
                sources.append({"title": r.get("title", url), "url": url})
        return content, sources
    except Exception as e:
        print(f"[TAVILY] Error: {e}")
        return "", []

def is_relevant(query, context_list, scores):
    if not scores:
        return False
    best_score = scores[0]

    # STRICT threshold
    if best_score > 0.5:
        return False

    # EXTRA SAFETY (keyword check)
    query_lower = query.lower()
    context_text = " ".join(context_list).lower()

    match_count = sum(1 for word in query_lower.split() if word in context_text)

    if match_count < 2:
        return False

    return True


SYSTEM_PROMPT_BASE = """You are VidyaSetu AI — an intelligent assistant for education and governance services in India.

You help students with:
- College admissions and enrollment processes
- Scholarships (central, state, private)
- Government education schemes
- Certificates (income, caste, bonafide, migration)
- Internships (government, private, research)
- NPTEL courses and online learning
- State government education schemes and welfare programs
- Competitive exams (JEE, NEET, GATE, UPSC, etc.)

RESPONSE FORMAT RULES:
- Respond ONLY in the language specified
- Do NOT mix languages
- Keep answers concise (max 8 lines) with bullet points when needed
- When presenting a SINGLE scholarship, internship, or state scheme with complete details, wrap it in a [CARD] block:

[CARD]
{"title": "Scheme Name", "provider": "Provider/State", "category": "scholarship|internship|state-scheme", "amount": "Rs. X", "deadline": "Date", "eligibility": "Brief eligibility", "apply_link": "https://...", "states": "State/All India", "type": "government|private|research", "icon": "🎓"}
[/CARD]

Only use [CARD] format when presenting a SINGLE specific item with structured details. For lists or general answers, use normal markdown."""


def generate_response(user_message: str, context_list: list[str] = [], scores: list[float] = [], past_messages: list = None, category: str = "general", language: str = "en", image_base64: str = None) -> str:
    if past_messages is None: past_messages = []
    try:
        use_rag = is_relevant(user_message, context_list, scores)

        if scores:
            print(f"[LLM] score: {scores[0]:.3f}")

        # Determine if this is a vision request
        use_vision = image_base64 is not None and len(image_base64) > 100

        if use_rag:
            print("Using RAG")
            context = "\n".join(context_list)
            system_prompt = f"""{SYSTEM_PROMPT_BASE}

Use ONLY the context below to answer.

Context:
{context}

IMPORTANT:
- Respond ONLY in the given language: {language}
- Do NOT mix languages
- Keep answers short (max 5 lines)
- Use bullet points if needed
"""
            active_tavily_sources = None
        else:
            print("Using Tavily Web Search")
            web_data, active_tavily_sources = search_web(user_message)
            system_prompt = f"""{SYSTEM_PROMPT_BASE}

Use the following real-time web data to answer:

{web_data}

IMPORTANT:
- Respond ONLY in the given language: {language}
- Do NOT mix languages
- Keep answers short (max 5 lines)
- Use bullet points if needed
"""

        messages_array = [{"role": "system", "content": system_prompt}]
        messages_array.extend(past_messages)

        # Build user message content
        if use_vision:
            print("[LLM] Using vision model for image analysis")
            user_content = [
                {"type": "text", "text": user_message},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{image_base64}"
                    }
                }
            ]
            messages_array.append({"role": "user", "content": user_content})
            model = VISION_MODEL
        else:
            messages_array.append({"role": "user", "content": user_message})
            model = TEXT_MODEL

        response = client.chat.completions.create(
            model=model,
            messages=messages_array
        )
        return response.choices[0].message.content, active_tavily_sources

    except Exception as e:
        print(f"[LLM] Groq Error: {e}")
        return "⚠️ AI service temporarily unavailable.", []
