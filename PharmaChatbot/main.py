from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import traceback

from rag_engine import RAGEngine
from gemini_service import generate_response, analyze_prescription

app = FastAPI(
    title="PharmaChatbot API",
    description="RAG-powered medical chatbot using Google Gemini + ChromaDB",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rag_engine = RAGEngine()

@app.get("/")
async def root():
    return {
        "message": "Welcome to PharmaChatbot API! 🏥",
        "status": "online",
        "documentation": "/docs"
    }

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str = Field(..., description="User's symptom description or question")
    age: Optional[int] = Field(None, description="Patient age in years")
    weight: Optional[float] = Field(None, description="Patient weight in kg")
    height: Optional[float] = Field(None, description="Patient height in cm")
    history: Optional[List[ChatMessage]] = Field(default=[], description="Previous conversation history")

class ChatResponse(BaseModel):
    reply: str
    sources_used: int
    disclaimer_included: bool

@app.get("/health")
async def health_check():
    doc_count = rag_engine.collection.count()
    return {
        "status": "healthy",
        "knowledge_base_docs": doc_count,
        "model": "gemini-1.5-flash",
    }

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        retrieved_docs = rag_engine.query(request.message, n_results=5)
        history = [{"role": m.role, "content": m.content} for m in request.history] if request.history else []
        reply = generate_response(
            user_message=request.message,
            rag_context=retrieved_docs,
            age=request.age,
            weight=request.weight,
            height=request.height,
            chat_history=history,
        )
        return ChatResponse(
            reply=reply,
            sources_used=len(retrieved_docs),
            disclaimer_included="Disclaimer" in reply or "disclaimer" in reply,
        )
    except Exception as e:
        print(f"[ERROR] /chat endpoint failed:\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-prescription")
async def analyze(file: UploadFile = File(...)):
    try:
        print(f"[DEBUG] Analyzing file: {file.filename}, Type: {file.content_type}")
        contents = await file.read()
        print(f"[DEBUG] File size: {len(contents)} bytes")
        analysis = analyze_prescription(contents, file.content_type)
        return {"analysis": analysis}
    except Exception as e:
        print(f"[ERROR] /analyze-prescription endpoint failed:\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/reload-kb")
async def reload_knowledge_base():
    try:
        rag_engine.load_knowledge_base()
        return {"status": "success", "total_documents": rag_engine.collection.count()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
