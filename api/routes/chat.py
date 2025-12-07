from fastapi import APIRouter
from pydantic import BaseModel
from api.utils.chatbot import chat_as_character

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    character_name: str
    character_description: str

@router.post("/character")
async def chat_with_character(payload: ChatRequest):
    """
    Chat with a selected character.
    """
    try:
        response = chat_as_character(
            user_input=payload.message,
            character_name=payload.character_name,
            character_desc=payload.character_description
        )
        return {
            "success": True,
            "response": response
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

