from fastapi import APIRouter
from pydantic import BaseModel
from api.utils.character_extractor import extract_characters_from_text

router = APIRouter()

class TextInput(BaseModel):
    text: str

@router.post("/extract")
async def extract_characters(payload: TextInput):
    characters = extract_characters_from_text(payload.text)
    return {"characters": characters}
