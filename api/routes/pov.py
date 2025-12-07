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
<<<<<<< HEAD
    """
    Rewrite story from character's POV.
    """
    try:
        rewritten_text = rewrite_story_from_pov(
            character_name=payload.character_name,
            traits=payload.traits,
            full_text=payload.text
        )
        return {
            "success": True,
            "rewritten_text": rewritten_text
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "rewritten_text": ""
        }

@router.post("/character")
async def rewrite_from_character(payload: RewriteRequest):
    """
    Alias endpoint for rewriting from character POV.
    """
    return await rewrite_story(payload)
=======
    rewritten_text = rewrite_story_from_pov(
        character_name=payload.character_name,
        traits=payload.traits,
        full_text=payload.text
    )
    return {"rewritten_text": rewritten_text}
>>>>>>> 4d03f41741da3cd494cf3ba79950082f672c4a98
