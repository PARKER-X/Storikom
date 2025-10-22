import os
import io
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from PyPDF2 import PdfReader

# Optional LLM integration
USE_GEMINI = False
try:
    import google.generativeai as genai  # type: ignore
    from dotenv import load_dotenv  # type: ignore
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        genai.configure(api_key=api_key)
        USE_GEMINI = True
except Exception:
    USE_GEMINI = False

app = FastAPI(title="Book POV Rewriter API", version="0.1.0")

# CORS for local dev: adjust as needed
origins = [
    "http://127.0.0.1:5500",  # VSCode Live Server default
    "http://localhost:5500",
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "*",  # relax for quick local testing; tighten for production
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for demo purposes (replace with DB/session as needed)
STATE: Dict[str, Any] = {
    "full_text": None,
}


class Character(BaseModel):
    name: str
    description: Optional[str] = ""


@app.get("/health")
async def health() -> Dict[str, str]:
    return {"status": "ok"}


def extract_text_from_pdf_bytes(data: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(data))
        texts: List[str] = []
        for page in reader.pages:
            txt = page.extract_text() or ""
            texts.append(txt)
        return "\n".join(texts).strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read PDF: {e}")


def heuristic_extract_characters(text: str, max_chars: int = 8) -> List[Dict[str, str]]:
    # Very naive heuristic: count capitalized tokens (could be names)
    import re
    tokens = re.findall(r"[A-Z][a-zA-Z'-]{2,}\b", text)
    freq: Dict[str, int] = {}
    for t in tokens:
        # Skip sentence starts that are common words
        if t.lower() in {"the", "and", "But", "For", "Not", "That", "This", "With"}:
            continue
        freq[t] = freq.get(t, 0) + 1
    top = sorted(freq.items(), key=lambda x: x[1], reverse=True)[:max_chars]
    out = []
    for name, count in top:
        out.append({
            "name": name,
            "description": f"Appears frequently in text (score {count})."
        })
    return out


def gemini_extract_characters(text: str) -> List[Dict[str, str]]:
    if not USE_GEMINI:
        return heuristic_extract_characters(text)
    try:
        # Keep context small for speed
        snippet = text[:3000]
        model = genai.GenerativeModel("gemini-2.5-flash")
        prompt = f"""
From the book text below, extract a list of the main characters.
For each character, return the following in exactly one line:

Character Name: Brief description (max 20 words)

Avoid using bullet points, asterisks, or markdown. Just a plain list.

TEXT:
{snippet}
"""
        resp = model.generate_content(prompt)
        output = resp.text or ""
        characters: List[Dict[str, str]] = []
        for line in output.splitlines():
            line = line.strip()
            if not line or ":" not in line:
                continue
            name, desc = line.split(":", 1)
            name = name.strip()
            desc = desc.strip()
            if name:
                characters.append({"name": name, "description": desc})
        return characters or heuristic_extract_characters(text)
    except Exception:
        return heuristic_extract_characters(text)


def gemini_rewrite(character: Character, full_text: str) -> str:
    if not USE_GEMINI:
        # Fallback: stylized local rewrite (very simple placeholder)
        excerpt = full_text[:1500]
        return (
            f"I am {character.name}. {character.description}\n\n" 
            f"Here is how I lived it: \n" 
            f"{excerpt}\n\n— {character.name}"
        )
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        prompt = f"""
You are {character.name}. Traits: {character.description}.
Rewrite the following story excerpt from your first-person point of view.
Not a summary; a rich, immersive retelling in your voice, with inner thoughts.

TEXT:
{full_text[:3500]}
"""
        resp = model.generate_content(prompt)
        return resp.text or ""
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rewrite failed: {e}")


@app.post("/upload")
async def upload(file: UploadFile = File(...)) -> JSONResponse:
    if file.content_type not in ("application/pdf", "application/octet-stream") and not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    data = await file.read()
    text = extract_text_from_pdf_bytes(data)
    if not text:
        raise HTTPException(status_code=400, detail="No text could be extracted from PDF")
    STATE["full_text"] = text
    # Optionally, return characters immediately
    chars = gemini_extract_characters(text)
    return JSONResponse({"message": "uploaded", "characters": chars})


@app.get("/characters")
async def characters() -> List[Dict[str, str]]:
    text = STATE.get("full_text")
    if not text:
        raise HTTPException(status_code=400, detail="No book uploaded yet")
    return gemini_extract_characters(text)


class RewriteRequest(BaseModel):
    character: Character


@app.post("/rewrite")
async def rewrite(req: RewriteRequest) -> Dict[str, str]:
    text = STATE.get("full_text")
    if not text:
        raise HTTPException(status_code=400, detail="No book uploaded yet")
    result = gemini_rewrite(req.character, text)
    return {"text": result}


# For local dev: uvicorn main:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
