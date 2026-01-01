from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "ENDF Nexus Backend Running!"}

@app.post("/chat")
async def chat(request: dict):
    # Placeholder – later connect Ollama
    return {"response": "AI response placeholder (connect Ollama later)"}