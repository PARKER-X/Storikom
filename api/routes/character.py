from fastapi import APIRouter
from pydantic import BaseModel
from api.utils.character_extractor import extract_characters_from_text

router = APIRouter()

class TextInput(BaseModel):
    text: str

@router.post("/extract")
async def extract_characters(payload: TextInput):
    """
    Extract characters from text and return list with names and descriptions.
    """
    try:
        characters = extract_characters_from_text(payload.text)
        return {
            "success": True,
            "characters": characters
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "characters": []
        }

@router.get("/list")
async def list_characters():
    """
    List all extracted characters (if stored in session/db).
    For now, returns empty - characters are extracted per request.
    """
    return {
        "success": True,
        "characters": []
    }

