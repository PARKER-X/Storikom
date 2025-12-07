from fastapi import APIRouter
from pydantic import BaseModel
from api.utils.character_extractor import extract_characters_from_text

router = APIRouter()

class TextInput(BaseModel):
    text: str

@router.post("/extract")
async def extract_characters(payload: TextInput):
<<<<<<< HEAD
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
=======
    print("Received text:", payload.text[:200])  # first 200 chars
    characters = extract_characters_from_text(payload.text)
    print("Extracted characters:", characters)
    return {"characters": characters}
>>>>>>> 4d03f41741da3cd494cf3ba79950082f672c4a98

