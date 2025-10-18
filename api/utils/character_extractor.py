import google.generativeai as genai
from typing import List
import os 
from dotenv import load_dotenv
import google.generativeai as genai

# Load Gemini API key
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
# Load Gemini model
model = genai.GenerativeModel("gemini-pro")

def extract_characters_from_text(text: str) -> List[dict]:
    """
    Use Google's Gemini model to extract characters from book text.
    """
    if len(text) > 3000:
        text = text[:3000]  # Keep prompt size within limits

    prompt = f"""
    From the following book text, extract the main characters.
    For each character, provide:
    - Name
    - Short description (role, personality, etc.)
    - (Optional) relationships with others

    TEXT:
    {text}
    """

    response = model.generate_content(prompt)
    output = response.text

    # Basic parsing (you can improve this)
    characters = []
    for line in output.split("\n"):
        if ":" in line:
            parts = line.split(":", 1)
            if len(parts) == 2:
                name = parts[0].strip()
                desc = parts[1].strip()
                characters.append({"name": name, "description": desc})
    
    return characters