"""Simple FastAPI wrapper for a local Llama.cpp-backed model using llama-cpp-python.
Place GGML model file in ./models (mounted into container at /models) and set MODEL_PATH.
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from llama_cpp import Llama

app = FastAPI(title="Clara Agent")

MODEL_PATH = os.environ.get("MODEL_PATH", "/models/ggml-model.bin")

# Lazy load model
_llama = None

def get_llama():
    global _llama
    if _llama is None:
        if not os.path.exists(MODEL_PATH):
            raise RuntimeError(f"Model not found at {MODEL_PATH}")
        _llama = Llama(model_path=MODEL_PATH)
    return _llama

class Prompt(BaseModel):
    prompt: str
    max_tokens: int = 512

@app.get("/health")
async def health():
    return {"status": "ok", "model": MODEL_PATH}

@app.post("/generate")
async def generate(p: Prompt):
    try:
        llm = get_llama()
        resp = llm(prompt=p.prompt, max_tokens=p.max_tokens)
        return {"text": resp.get('choices',[{}])[0].get('text','')}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Example: agent pushes inference results to backend
@app.post("/push-result")
async def push_result(payload: dict):
    import requests
    backend = os.environ.get('BACKEND_URL')
    key = os.environ.get('PRIMEOS_API_KEY')
    if not backend or not key:
        raise HTTPException(status_code=500, detail='BACKEND_URL or PRIMEOS_API_KEY not set')
    headers = {'x-primeos-key': key}
    r = requests.post(f"{backend}/agent/submit", json=payload, headers=headers, timeout=30)
    return {"status": r.status_code, "body": r.text}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
