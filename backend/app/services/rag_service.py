"""
RAG Service — Semantic retrieval using sentence-transformers + FAISS.
Encodes sample documents, FAQs, scholarships, competitive exams,
internships, and state schemes into a FAISS vector index
and retrieves the top-k most relevant chunks for a given query.
"""

from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
from app.database.crud import (
    get_all_faqs, search_scholarships, get_all_scholarships,
    get_all_exams, get_all_internships, get_all_state_schemes
)

# ── Embedding model ────────────────────────────────────────────────────────────
print("[RAG] Loading embedding model (all-MiniLM-L6-v2) ...")
_embed_model = SentenceTransformer("all-MiniLM-L6-v2")
print("[RAG] Embedding model loaded [OK]")

# ── Document store ─────────────────────────────────────────────────────────────
_documents: list[str] = []
_sources: list[str] = []
_index: faiss.IndexFlatL2 | None = None
_index_built = False

# ── Sample knowledge base ──────────────────────────────────────────────────────
SAMPLE_DOCUMENTS = [
    "Karnataka SSP Scholarship amount ranges from ₹5000 to ₹15000 depending on category.",
    "Post Matric Scholarship is for SC/ST/OBC students.",
    "National Scholarship Portal provides central government scholarships.",
    "PM Scholarship Scheme offers financial aid for defense personnel children.",
    "SSP portal official website: ssp.postmatric.karnataka.gov.in",
]


def _scholarship_to_text(s: dict) -> str:
    """Convert a scholarship DB row to a readable text chunk."""
    return (
        f"Scholarship: {s['name']}\n"
        f"Provider: {s['provider']}\n"
        f"Category: {s['category']}\n"
        f"Eligibility: {s['eligibility']}\n"
        f"Amount: {s['amount']}\n"
        f"Deadline: {s.get('deadline', 'Check official website')}\n"
        f"Apply at: {s.get('apply_link', 'scholarships.gov.in')}\n"
        f"Required Documents: {s.get('documents', 'Standard documents')}\n"
        f"Available for: {s.get('states', 'All India')}\n"
        f"Level: {s.get('level', 'Various')}"
    )

def _exam_to_text(e: dict) -> str:
    """Convert a competitive exam DB row to a readable text chunk."""
    return (
        f"Competitive Exam: {e['name']}\n"
        f"Conducting Body: {e['conducting_body']}\n"
        f"Level: {e['level']}\n"
        f"Purpose: {e['purpose']}\n"
        f"Eligibility: {e['eligibility']}\n"
        f"Exam Mode: {e.get('exam_mode', 'N/A')}\n"
        f"Official Website: {e.get('official_website', 'N/A')}"
    )

def _internship_to_text(i: dict) -> str:
    """Convert an internship DB row to a readable text chunk."""
    return (
        f"Internship: {i['title']}\n"
        f"Organization: {i['organization']}\n"
        f"Domain: {i['domain']}\n"
        f"Duration: {i.get('duration', 'Varies')}\n"
        f"Stipend: {i.get('stipend', 'Not specified')}\n"
        f"Eligibility: {i.get('eligibility', 'Check website')}\n"
        f"Type: {i.get('type', 'general')}\n"
        f"Available for: {i.get('states', 'All India')}\n"
        f"Apply at: {i.get('apply_link', 'Check official website')}\n"
        f"Deadline: {i.get('deadline', 'Check official website')}"
    )

def _state_scheme_to_text(s: dict) -> str:
    """Convert a state scheme DB row to a readable text chunk."""
    return (
        f"State Government Scheme: {s['name']}\n"
        f"State: {s['state']}\n"
        f"Department: {s.get('department', 'N/A')}\n"
        f"Category: {s.get('category', 'Education')}\n"
        f"Eligibility: {s.get('eligibility', 'Check website')}\n"
        f"Benefit: {s.get('benefit', 'Check website')}\n"
        f"Apply at: {s.get('apply_link', 'Check official website')}\n"
        f"Deadline: {s.get('deadline', 'Check official website')}\n"
        f"Required Documents: {s.get('documents', 'Standard documents')}"
    )


def _build_index():
    """Build (or rebuild) the FAISS index from all available data sources."""
    global _documents, _sources, _index, _index_built

    _documents = []
    _sources = []

    # 1. Add sample / static documents
    for doc in SAMPLE_DOCUMENTS:
        _documents.append(doc)
        _sources.append({"title": "Knowledge Base", "url": ""})

    # 2. Add FAQs from database
    try:
        faqs = get_all_faqs()
        for f in faqs:
            text = f"Question: {f['question']}\nAnswer: {f['answer']}"
            _documents.append(text)
            _sources.append({"title": f"FAQ #{f['id']} [{f['category']}]", "url": ""})
    except Exception as e:
        print(f"[RAG] Warning: could not load FAQs — {e}")

    # 3. Add scholarships from database
    try:
        scholarships = get_all_scholarships()
        for s in scholarships:
            _documents.append(_scholarship_to_text(s))
            url = s.get('apply_link', '')
            if url and not url.startswith('http'): url = 'https://' + url
            _sources.append({"title": s['name'], "url": url})
    except Exception as e:
        print(f"[RAG] Warning: could not load scholarships — {e}")

    # 4. Add competitive exams from database
    try:
        exams = get_all_exams()
        for e in exams:
            _documents.append(_exam_to_text(e))
            url = e.get('official_website', '')
            if url and not url.startswith('http'): url = 'https://' + url
            _sources.append({"title": e['name'], "url": url})
    except Exception as ex:
        print(f"[RAG] Warning: could not load exams — {ex}")

    # 5. Add internships from database
    try:
        internships = get_all_internships()
        for i in internships:
            _documents.append(_internship_to_text(i))
            url = i.get('apply_link', '')
            if url and not url.startswith('http'): url = 'https://' + url
            _sources.append({"title": i['title'], "url": url})
    except Exception as e:
        print(f"[RAG] Warning: could not load internships — {e}")

    # 6. Add state schemes from database
    try:
        schemes = get_all_state_schemes()
        for s in schemes:
            _documents.append(_state_scheme_to_text(s))
            url = s.get('apply_link', '')
            if url and not url.startswith('http'): url = 'https://' + url
            _sources.append({"title": s['name'], "url": url})
    except Exception as e:
        print(f"[RAG] Warning: could not load state schemes — {e}")

    if not _documents:
        print("[RAG] No documents to index!")
        _index_built = True
        return

    # 7. Create embeddings and FAISS index
    print(f"[RAG] Encoding {len(_documents)} documents ...")
    embeddings = _embed_model.encode(_documents, show_progress_bar=False)
    embeddings = np.array(embeddings).astype("float32")

    dim = embeddings.shape[1]
    _index = faiss.IndexFlatL2(dim)
    _index.add(embeddings)

    _index_built = True
    print(f"[RAG] FAISS index built with {_index.ntotal} vectors (dim={dim}) [OK]")


def retrieve_context(query: str, top_k: int = 3) -> tuple[str, float, list[str]]:
    """
    Retrieve the top-k most relevant document chunks for a query.

    Returns:
        (context_string, best_l2_score, list_of_source_labels)
        A lower score means a better match. Score < 1.0 is a strong match.
    """
    global _index_built

    # Lazy-build index on first call
    if not _index_built:
        _build_index()

    # If index is empty or missing, return no context with high score
    if _index is None or _index.ntotal == 0:
        return "", 9999.0, []

    # Encode the query
    query_embedding = _embed_model.encode([query])
    query_embedding = np.array(query_embedding).astype("float32")

    # Search FAISS
    distances, indices = _index.search(query_embedding, k=min(top_k, _index.ntotal))

    results = []
    result_sources = []
    result_scores = []

    for dist, idx in zip(distances[0], indices[0]):
        if idx == -1:
            continue
        results.append(_documents[idx])
        result_sources.append(_sources[idx])
        result_scores.append(float(dist))

    return results, result_scores, result_sources


def rebuild_index():
    """Force a full re-index (call after FAQ / scholarship data changes)."""
    global _index_built
    _index_built = False
    _build_index()
