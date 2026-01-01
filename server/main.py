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
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Offline setup – local LLM + local embeddings
Settings.llm = Ollama(model="llama3", request_timeout=300.0)
Settings.embed_model = HuggingFaceEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")  # Offline, downloads once

# Your document folder
doc_path = "INGEST_FOLDER"  # Change to "docs", "data", or exact name
if not os.path.exists(doc_path):
    doc_path = "."  # Fallback
documents = SimpleDirectoryReader(doc_path).load_data()
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine()

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
def chat(request: ChatRequest):
    rag_context = query_engine.query(request.message)
    full_prompt = f"ENDF Context: {rag_context}\nQuery: {request.message}\nAnswer tactically."
    response = Settings.llm.complete(full_prompt)
    return {"response": str(response)}

@app.get("/")
def home():
    return {"status": "Offline ENDF Nexus Ready – Llama3 + Local RAG"}