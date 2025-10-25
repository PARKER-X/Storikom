from fastapi import APIRouter
from pydantic import BaseModel
from api.utils.pov_rewriter import rewrite_story_from_pov

router = APIRouter()

class RewriteRequest(BaseModel):
    text: str
    character_name: str
    traits: str

@router.post("/")
async def rewrite_story(payload: RewriteRequest):
    rewritten_text = rewrite_story_from_pov(
        character_name=payload.character_name,
        traits=payload.traits,
        full_text=payload.text
    )
    return {"rewritten_text": rewritten_text}
