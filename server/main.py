from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.llms.ollama import Ollama
from llama_index.embeddings.huggingface import HuggingFaceEmbedding

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or "http://localhost:3000"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Fully offline
Settings.llm = Ollama(model="llama3", request_timeout=300.0)
Settings.embed_model = HuggingFaceEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")

# Your folder (change to exact name – "INGEST_FOLDER", "docs", "data")
doc_path = "INGEST_FOLDER"
if not os.path.exists(doc_path):
    doc_path = "docs"  # Try common names
if not os.path.exists(doc_path):
    doc_path = "."  # Root fallback
documents = SimpleDirectoryReader(doc_path).load_data()
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine()

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
def chat(request: ChatRequest):
    rag_context = query_engine.query(request.message)
    prompt = f"ENDF Document Context: {rag_context}\n\nQuery: {request.message}\nAnswer as ENDF officer – concise, tactical."
    response = Settings.llm.complete(prompt)
    return {"response": str(response)}

@app.get("/")
def home():
    return {"status": "Offline ENDF Nexus – Llama3 + Local RAG Ready"}