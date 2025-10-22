from fastapi import FastAPI, File, UploadFile, Request
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from api.utils.character_extractor import extract_characters_from_text
from api.utils.pov_rewriter import rewrite_story_from_pov

import os
import shutil
from pathlib import Path

app = FastAPI()

# Mount static files (CSS, JS)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates directory
templates = Jinja2Templates(directory="templates")

# Enable CORS (allow frontend JS to call backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Temp store for extracted text and characters
uploaded_text = ""
extracted_characters = []

# Serve index.html
@app.get("/", response_class=HTMLResponse)
async def serve_index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# PDF Upload Endpoint
@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    global uploaded_text

    file_path = UPLOAD_DIR / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # ✅ Extract PDF text (assume this function exists)
    from api.routes.pdf_extract import extract_text_from_pdf  # update to your actual module
    uploaded_text = extract_text_from_pdf(file_path)

    return {"message": "PDF uploaded and text extracted."}

# Extract Characters Endpoint
@app.get("/characters")
async def get_characters():
    global uploaded_text, extracted_characters

    if not uploaded_text:
        return {"error": "No uploaded text found."}

    extracted_characters = extract_characters_from_text(uploaded_text)
    return extracted_characters

# Rewrite Story Endpoint
@app.post("/rewrite")
async def rewrite_story(character: dict):
    global uploaded_text

    if not character.get("name") or not character.get("description"):
        return {"error": "Character name and description required."}

    rewritten = rewrite_story_from_pov(
        character_name=character["name"],
        traits=character["description"],
        full_text=uploaded_text
    )
    return rewritten
