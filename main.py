from fastapi import FastAPI
from api.routes import pdf_extracter, character, pov, embed, chat
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse

app = FastAPI(title="BookiFi API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],    # tighten for prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static assets (CSS, JS) from ./static
app.mount("/static", StaticFiles(directory="static"), name="static")

# Root route serves the homepage (index.html)
@app.get("/")
def read_index():
    return FileResponse("templates/index.html", media_type="text/html")

# Story page route
@app.get("/story")
def read_story():
    return FileResponse("templates/story.html", media_type="text/html")

# Include routers
app.include_router(pdf_extracter.router, prefix="/pdf", tags=["PDF"])
app.include_router(character.router, prefix="/characters", tags=["Characters"])
app.include_router(pov.router, prefix="/rewrite", tags=["Rewrite"])
app.include_router(embed.router, prefix="/embed", tags=["Embeddings"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
