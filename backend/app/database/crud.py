from app.database.db import get_connection


# ── Chat History ───────────────────────────────────────────────────────────────

def save_chat(session_id, user_message, bot_reply, language, category="general"):
    conn = get_connection()
    conn.execute(
        "INSERT INTO chat_history (session_id, user_message, bot_reply, language, category) VALUES (?, ?, ?, ?, ?)",
        (session_id, user_message, bot_reply, language, category)
    )
    conn.commit()
    conn.close()

def get_chat_history(session_id, limit=50):
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM chat_history WHERE session_id=? ORDER BY timestamp ASC LIMIT ?",
        (session_id, limit)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_all_chats(limit=200):
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM chat_history ORDER BY timestamp DESC LIMIT ?", (limit,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_chat_sessions():
    conn = get_connection()
    rows = conn.execute("""
        SELECT session_id as chat_id, MIN(user_message) as title, MIN(timestamp) as created_at
        FROM chat_history
        GROUP BY session_id
        ORDER BY created_at DESC
    """).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def delete_chat_session(session_id):
    conn = get_connection()
    conn.execute("DELETE FROM chat_history WHERE session_id=?", (session_id,))
    conn.commit()
    conn.close()


# ── FAQs ───────────────────────────────────────────────────────────────────────

def get_all_faqs(category=None):
    conn = get_connection()
    if category:
        rows = conn.execute("SELECT * FROM faqs WHERE category=? ORDER BY id DESC", (category,)).fetchall()
    else:
        rows = conn.execute("SELECT * FROM faqs ORDER BY id DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def create_faq(question, answer, category, language="en"):
    conn = get_connection()
    cur = conn.execute(
        "INSERT INTO faqs (question, answer, category, language) VALUES (?, ?, ?, ?)",
        (question, answer, category, language)
    )
    conn.commit()
    fid = cur.lastrowid
    conn.close()
    return fid

def update_faq(faq_id, question=None, answer=None, category=None):
    conn = get_connection()
    faq = dict(conn.execute("SELECT * FROM faqs WHERE id=?", (faq_id,)).fetchone())
    conn.execute("UPDATE faqs SET question=?, answer=?, category=? WHERE id=?",
                 (question or faq["question"], answer or faq["answer"], category or faq["category"], faq_id))
    conn.commit()
    conn.close()

def delete_faq(faq_id):
    conn = get_connection()
    conn.execute("DELETE FROM faqs WHERE id=?", (faq_id,))
    conn.commit()
    conn.close()


# ── Scholarships ───────────────────────────────────────────────────────────────

def get_all_scholarships(state=None, level=None, category=None):
    conn = get_connection()
    query = "SELECT * FROM scholarships WHERE 1=1"
    params = []
    if state:
        query += " AND (states LIKE ? OR states = 'All India')"
        params.append(f"%{state}%")
    if level:
        query += " AND level LIKE ?"
        params.append(f"%{level}%")
    if category:
        query += " AND category LIKE ?"
        params.append(f"%{category}%")
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def search_scholarships(keyword):
    """Full-text keyword search across scholarship fields."""
    conn = get_connection()
    kw = f"%{keyword}%"
    rows = conn.execute(
        """SELECT * FROM scholarships WHERE
           name LIKE ? OR provider LIKE ? OR eligibility LIKE ?
           OR category LIKE ? OR states LIKE ? OR level LIKE ?
           OR amount LIKE ?""",
        (kw, kw, kw, kw, kw, kw, kw)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_scholarship_by_id(sid):
    conn = get_connection()
    row = conn.execute("SELECT * FROM scholarships WHERE id=?", (sid,)).fetchone()
    conn.close()
    return dict(row) if row else None


# ── Stats ──────────────────────────────────────────────────────────────────────

def get_stats():
    conn = get_connection()
    total_chats = conn.execute("SELECT COUNT(*) FROM chat_history").fetchone()[0]
    total_faqs = conn.execute("SELECT COUNT(*) FROM faqs").fetchone()[0]
    total_scholarships = conn.execute("SELECT COUNT(*) FROM scholarships").fetchone()[0]
    today_chats = conn.execute(
        "SELECT COUNT(*) FROM chat_history WHERE DATE(timestamp)=DATE('now')"
    ).fetchone()[0]
    lang_dist = conn.execute(
        "SELECT language, COUNT(*) as count FROM chat_history GROUP BY language"
    ).fetchall()
    cat_dist = conn.execute(
        "SELECT category, COUNT(*) as count FROM chat_history GROUP BY category"
    ).fetchall()
    conn.close()
    return {
        "total_chats": total_chats,
        "total_faqs": total_faqs,
        "total_scholarships": total_scholarships,
        "today_chats": today_chats,
        "language_distribution": [dict(r) for r in lang_dist],
        "category_distribution": [dict(r) for r in cat_dist],
    }

# ── Competitive Exams ──────────────────────────────────────────────────────────

def get_all_exams():
    conn = get_connection()
    rows = conn.execute("SELECT * FROM competitive_exams ORDER BY id ASC").fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ── Internships ────────────────────────────────────────────────────────────────

def get_all_internships(state=None, domain=None, type_filter=None):
    conn = get_connection()
    query = "SELECT * FROM internships WHERE 1=1"
    params = []
    if state:
        query += " AND (states LIKE ? OR states = 'All India')"
        params.append(f"%{state}%")
    if domain:
        query += " AND domain LIKE ?"
        params.append(f"%{domain}%")
    if type_filter:
        query += " AND type = ?"
        params.append(type_filter)
    query += " ORDER BY id ASC"
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def search_internships(keyword):
    """Full-text keyword search across internship fields."""
    conn = get_connection()
    kw = f"%{keyword}%"
    rows = conn.execute(
        """SELECT * FROM internships WHERE
           title LIKE ? OR organization LIKE ? OR domain LIKE ?
           OR eligibility LIKE ? OR states LIKE ? OR type LIKE ?
           OR stipend LIKE ?""",
        (kw, kw, kw, kw, kw, kw, kw)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_internship_by_id(iid):
    conn = get_connection()
    row = conn.execute("SELECT * FROM internships WHERE id=?", (iid,)).fetchone()
    conn.close()
    return dict(row) if row else None


# ── State Schemes ──────────────────────────────────────────────────────────────

def get_all_state_schemes(state=None, category=None):
    conn = get_connection()
    query = "SELECT * FROM state_schemes WHERE 1=1"
    params = []
    if state:
        query += " AND state = ?"
        params.append(state)
    if category:
        query += " AND category LIKE ?"
        params.append(f"%{category}%")
    query += " ORDER BY id ASC"
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def search_state_schemes(keyword):
    """Full-text keyword search across state scheme fields."""
    conn = get_connection()
    kw = f"%{keyword}%"
    rows = conn.execute(
        """SELECT * FROM state_schemes WHERE
           name LIKE ? OR state LIKE ? OR department LIKE ?
           OR category LIKE ? OR eligibility LIKE ? OR benefit LIKE ?""",
        (kw, kw, kw, kw, kw, kw)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_state_schemes_by_state(state):
    """Convenience wrapper."""
    return get_all_state_schemes(state=state)

def get_state_scheme_by_id(sid):
    conn = get_connection()
    row = conn.execute("SELECT * FROM state_schemes WHERE id=?", (sid,)).fetchone()
    conn.close()
    return dict(row) if row else None

