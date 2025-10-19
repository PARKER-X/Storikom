import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load Gemini API key
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")

def rewrite_story_from_pov(character_name, traits, full_text):
    """
    Rewrite the entire story from the character's point of view.
    """
    if len(full_text) > 10000:
        full_text = full_text[:10000]  # Limit to keep within Gemini context window

    prompt = f"""
    You are {character_name}, a character with the following traits: {traits}.

    Rewrite the following story from your point of view.
    Include your internal thoughts, emotions, and motivations as events unfold.
    Keep the tone consistent with your personality.

    STORY:
    {full_text}
    """

    response = model.generate_content(prompt)
    return response.text
