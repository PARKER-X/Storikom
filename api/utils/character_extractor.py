import google.generativeai as genai
from typing import List
import os
from dotenv import load_dotenv

# Load Gemini API key
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Load Gemini model
model = genai.GenerativeModel("gemini-2.5-flash")

def extract_characters_from_text(text: str, debug: bool = False) -> List[dict]:
    """
    Extract main characters using Gemini from the book text.
    Returns a list of dicts: [{"name": ..., "description": ...}]
    """
    if len(text) > 3000:
        text = text[:3000]  # Limit to keep context small and fast

    prompt = f"""
From the book text below, extract a list of the main characters.
For each character, return the following in exactly one line:

Character Name: Brief description (max 20 words)

Avoid using bullet points, asterisks, or markdown. Just a plain list.

EXAMPLE FORMAT:
Frodo Baggins: A brave hobbit chosen to carry the One Ring.
Gandalf: A wise wizard guiding the fellowship on their quest.

TEXT:
{text}
"""

    try:
        response = model.generate_content(prompt)
        output = response.text

        if debug:
            print("\n🔍 GEMINI RAW RESPONSE:\n")
            print(output)
        
        characters = []
        for line in output.splitlines():
            line = line.strip()
            if not line or ":" not in line:
                continue

            parts = line.split(":", 1)
            name = parts[0].strip()
            desc = parts[1].strip()

            if name and desc and len(name) < 100:
                characters.append({
                    "name": name,
                    "description": desc
                })

        return characters

    except Exception as e:
        if debug:
            print("⚠️ Error calling Gemini:", e)
        return []
