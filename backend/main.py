from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import chat, history, scholarships, internships, nptel, state_schemes
from app.database.db import init_db

app = FastAPI(
    title="EduGov AI Assistant API",
    description="Language Agnostic Intelligent Chatbot for Education & Governance",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(history.router, prefix="/api", tags=["History"])
app.include_router(scholarships.router, prefix="/api", tags=["Scholarships"])
app.include_router(internships.router, prefix="/api", tags=["Internships"])
app.include_router(nptel.router, prefix="/api", tags=["NPTEL"])
app.include_router(state_schemes.router, prefix="/api", tags=["State Schemes"])

@app.on_event("startup")
async def startup():
    init_db()
    print("[OK] Database initialized")

@app.get("/")
def root():
    return {"message": "EduGov AI API is running", "status": "ok"}

@app.get("/health")
def health():
    return {"status": "healthy"}
