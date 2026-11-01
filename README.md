---
# 📌 Project Title
VidyaSetu – AI Education & Governance Assistant

---

# 🚀 Overview

VidyaSetu is a language-agnostic intelligent assistant designed to help students and citizens navigate college admissions, scholarships, government schemes, and certificates. 

What makes it unique: It supports multiple Indian languages (English, Hindi, Kannada, Telugu, Tamil), offers fast voice input/output through browser APIs, and features a hybrid RAG architecture using FAISS + Groq Llama 3.1 with a smart fallback to Tavily Web Search when local knowledge is insufficient.

---

# 🧠 Key Features

* **RAG-based chatbot**: High-accuracy answers backed by a local SQLite knowledge base.
* **Multilingual support**: Deep integration of English, Hindi, Kannada, Telugu, and Tamil.
* **Voice input**: Real-time browser-based SpeechRecognition.
* **Voice output**: Text-to-Speech (TTS) using native browser `speechSynthesis`.
* **Scholarship & exam guidance**: Rich built-in database of Indian schemes and competitive exams.
* **Smart fallback**: Seamlessly switches to web search (Tavily) if the RAG score is low.

---

# 🏗️ Tech Stack

## Frontend:
* React / Vite
* Vanilla CSS (`index.css`)
* Web Speech API (`SpeechRecognition` and `speechSynthesis`)
* Zustand (State Management)
* Lucide React (Icons)

## Backend:
* FastAPI (Python)
* DeepTranslator (`GoogleTranslator`)

## AI:
* **RAG Vector Store**: FAISS
* **Embeddings**: `sentence-transformers` (`all-MiniLM-L6-v2`)
* **LLM**: Groq API (`llama-3.1-8b-instant`)
* **Web Search**: Tavily API

## Database:
* SQLite (`chatbot.db`) managed via native `sqlite3`

---

# 🧩 System Architecture

**Text-based Architecture Diagram:**
`User → Frontend (Web Speech API) → FastAPI → Translate → FAISS (RAG) → Groq (LLM) / Tavily → Frontend`

### Component Explanation:
1. **Frontend**: Captures user input (text or voice) and the selected language, sending it to the FastAPI backend. Handles Markdown rendering and Text-to-Speech.
2. **Translation Service**: Translates non-English queries into English so they can be effectively matched against the English knowledge base.
3. **RAG Service**: Embeds the English query and searches the FAISS vector database (populated from SQLite FAQs, scholarships, and exams).
4. **LLM Service**: Evaluates the retrieved RAG context. If relevant, it prompts the Llama-3 model using the context. If not, it fetches real-time data via Tavily and passes that to the model. The prompt enforces the model to output the response in the user's original language.
5. **Database**: SQLite acts as the source of truth, storing chat history, FAQs, competitive exams, and scholarship details.

---

# 🔄 Workflow

1. User inputs a query via text or voice.
2. Frontend sends the request with the selected language code (e.g., `hi-IN`).
3. Backend receives the request and translates the query to English.
4. Backend detects the query category (admissions, scholarships, government, etc.).
5. Backend retrieves the top-k context chunks using FAISS (RAG).
6. A strict relevance check evaluates the L2 distance score and keyword matches.
   * **If relevant**: The context is injected into the LLM system prompt.
   * **Else**: The system falls back to Tavily web search, injecting live web data.
7. The Groq LLM generates a response strictly formatted in the requested language.
8. The backend saves the chat session to SQLite.
9. Response and source links are returned to the frontend.
10. The user can optionally click "Read" to trigger browser-based TTS.

---

# 🔍 RAG Explanation

* **Embedding creation**: On startup (or lazily), the system reads SQLite data (Scholarships, FAQs, Exams), formats them into text chunks, and encodes them using `all-MiniLM-L6-v2`.
* **Vector search**: The embeddings are stored in a FAISS `IndexFlatL2`. Queries are converted to vectors and compared using L2 distance.
* **Similarity threshold**: The system requires a score < 0.5 and at least 2 keyword matches to trust the RAG context. If the score is higher, the system rejects the context to prevent hallucinations.
* **Context injection**: The relevant chunks are stringified and injected directly into the Groq system prompt, instructing the model to answer *only* using the provided context.

---

# 🎤 Voice Module

* **SpeechRecognition (Input)**: Built into `ChatPage.jsx`, utilizing the `webkitSpeechRecognition` API. It runs continuously, capturing interim and final transcripts and auto-updating the chat input box. It respects the selected language dropdown.
* **SpeechSynthesis (Output)**: A `speakText` utility maps the user's selected language to the closest available voice on their local OS/Browser, speaking the markdown-stripped response text.

---

# 🌍 Multilingual System

* **Language Dropdown**: Users select their language (English, Hindi, Kannada, Telugu).
* **Translation Flow**: `translate_service.py` uses `DeepTranslator` to convert regional languages to English before RAG retrieval.
* **Language Enforcement**: The Groq LLM prompt explicitly commands: `Respond ONLY in the given language: {language}. Do NOT mix languages.` ensuring high-quality, native-sounding responses.

---

# 📂 Folder Structure

* **`backend/`**: Contains the FastAPI server.
  * **`app/routes/`**: API endpoints (`chat.py`, `history.py`, `scholarships.py`).
  * **`app/services/`**: Core logic including `llm_service.py`, `rag_service.py`, and `translate_service.py`.
  * **`app/database/`**: SQLite initializers, `crud.py`, and the `chatbot.db` file.
  * **`app/models/`**: Pydantic schemas for request validation.
  * **`.env`**: Environment configuration.
  * **`main.py`**: FastAPI entry point.
* **`frontend/`**: Contains the React/Vite application.
  * **`src/components/`**: Reusable UI (e.g., `Message.jsx`, `Sidebar.jsx`).
  * **`src/pages/`**: Main views (`ChatPage.jsx`, `HeroPage.jsx`, `ScholarshipsPage.jsx`).
  * **`src/services/`**: API connectors.
  * **`src/utils/`**: Helper scripts like `audio.js`.
  * **`src/store/`**: Zustand global state.

---

# ⚙️ Setup Instructions

### Backend:
1. Open terminal and navigate to `backend/`.
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   * Windows: `venv\Scripts\activate`
   * Mac/Linux: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Run the server: `uvicorn main:app --reload --port 8000`

### Frontend:
1. Open a new terminal and navigate to `frontend/`.
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

---

# 🔐 Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
GROQ_API_KEY=your_groq_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

---

# 🧪 Example Queries

* **English**: "What is the PM scholarship scheme?" -> Returns eligibility and deadline data from the local database.
* **Hindi**: "मुफ्त लैपटॉप योजना क्या है?" -> Translates, searches DB/Web, and replies in Hindi.
* **Voice**: Select Kannada, tap the microphone, speak your question. The system transcribes, processes, and replies in Kannada.

---

# ⚠️ Limitations

* Depends heavily on the accuracy of the local SQLite dataset.
* Voice recognition accuracy varies depending on the user's browser, OS, and microphone quality.
* `DeepTranslator` uses free APIs, which might face rate limits on high load.
* No continuous, real-time streaming of LLM tokens (responses appear all at once).

---

# 🔮 Future Improvements

* Add a dedicated Whisper API backend for flawless voice transcription.
* Add a real analytics dashboard for admins to view usage metrics.
* Implement user authentication to save user profiles and custom scholarship matches.
* Migrate to a robust cloud database like PostgreSQL and deploy via AWS/Vercel.
