import ollama
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from llama_index import load_index_from_storage, StorageContext

app = FastAPI()

# Load RAG (from \index_storage)
storage_context = StorageContext.from_defaults(persist_dir="./index_storage")
index = load_index_from_storage(storage_context)
query_engine = index.as_query_engine()

class QueryRequest(BaseModel):
    prompt: str
    role: str  # e.g., "Chief of General Staff" from image 4
    language: str = "English"  # Multilingual per image 3

@app.post("/api/ai/query")  # For chatbots/SLAS/IFAN
async def ai_query(request: QueryRequest):
    try:
        rag_context = query_engine.query(request.prompt).response  # Pulls from docs (images 3-6)
        full_prompt = f"ENDF Nexus AI. Role: {request.role}. Context (laws from doc, psychology): {rag_context}. Query: {request.prompt}. Respond in {request.language}."
        response = ollama.chat(model='llama3', messages=[{'role': 'user', 'content': full_prompt}])
        return {"response": response['message']['content']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/report")  # For "REPORT OF ENDF" (image 4 feedback)
async def generate_report(insights: list[str]):
    full_prompt = f"Cluster insights and generate REPORT OF ENDF using docs: {', '.join(insights)}."
    response = ollama.chat(model='llama3', messages=[{'role': 'user', 'content': full_prompt}])
    return {"report": response['message']['content']}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)