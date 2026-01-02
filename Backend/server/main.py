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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Offline Llama3 + local embeddings
Settings.llm = Ollama(model="llama3", request_timeout=300.0)
Settings.embed_model = HuggingFaceEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")

# RAG from your full PDF
doc_path = "docs"  # Folder with ENDF_full_documentation.pdf
if not os.path.exists(doc_path):
    doc_path = "."  # Fallback
documents = SimpleDirectoryReader(doc_path).load_data()
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine()

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
def chat(request: ChatRequest):
    # RAG from full document
    rag_context = query_engine.query(request.message)
    prompt = f"""You are SLAS for ENDF (from full system documentation).