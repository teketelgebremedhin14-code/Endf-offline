from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.llms.ollama import Ollama

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup Llama3 + RAG (change "INGEST_FOLDER" to your folder name, e.g. "docs" or "data")
Settings.llm = Ollama(model="llama3", request_timeout=300.0)
doc_path = "INGEST_FOLDER"  # <-- Your folder with ENDF_full_documentation.txt or .pdf
if not os.path.exists(doc_path):
    doc_path = "."  # Fallback to root if wrong name
documents = SimpleDirectoryReader(doc_path).load_data()
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine()

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
def chat(request: ChatRequest):
    # RAG: Get context from your ENDF document
    rag_context = query_engine.query(request.message)
    full_prompt = f"""You are SLAS, Smart Leadership Assistant for ENDF.
Use this ENDF document context: {rag_context}

Question: {request.message}
Answer concisely in tactical military style."""
    
    # Call Llama3
    response = Settings.llm.complete(full_prompt)
    return {"response": str(response)}

@app.get("/")
def home():
    return {"status": "ENDF Nexus + Llama3 RAG Connected! Document loaded."}