<<<<<<< HEAD
from fastapi import APIRouter
from pydantic import BaseModel
from api.routes.chroma_db import embed_and_save
from langchain.text_splitter import RecursiveCharacterTextSplitter

router = APIRouter()

class EmbedRequest(BaseModel):
    text: str
    book_id: str = "default"

def _chunk_text(text: str, chunk_size: int = 500, chunk_overlap: int = 50):
    """
    Simple text chunking function.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )
    return splitter.split_text(text)

@router.post("/generate")
async def generate_embeddings(payload: EmbedRequest):
    """
    Generate embeddings from text and save to ChromaDB.
    """
    try:
        # Chunk the text
        chunks = _chunk_text(payload.text)
        
        # Embed and save to ChromaDB
        embed_and_save(chunks, payload.book_id)
        
        return {
            "success": True,
            "message": f"Generated embeddings for {len(chunks)} chunks",
            "chunks_count": len(chunks)
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
=======
from langchain.text_splitter import RecursiveCharacterTextSplitter

def chunk_text(text):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    return splitter.split_text(text)
>>>>>>> 4d03f41741da3cd494cf3ba79950082f672c4a98
