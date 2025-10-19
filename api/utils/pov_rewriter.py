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
    if len(full_text) > 40000:
        full_text = full_text[:40000]  # Limit to keep within Gemini context window

    prompt = f"""
You are **{character_name}**, a major character in the story below.

Your traits and personality are as follows: {traits}.

Now, rewrite the **entire story** from **your perspective**. Follow these strict instructions:

- 🧠 Tell the story in **first-person narration** as if you're living it.
- 🪞 Start with your **origin, past, and beliefs** before the story begins.
- ⚔️ Describe all major events **as you experienced them** — your fears, hopes, pain, anger, love, jealousy, pride.
- 🧭 When other characters act, describe how **you perceived** them — not objective truth, but your **emotional truth**.
- 🌊 Show your **emotional evolution** through the events of the story.
- 🕊 If you die, end with your **final thoughts** or **emotional resolution**.

This is not a summary or analysis. This is a **rewriting of the story** from your **soul's point of view**. Stay fully in character.

---

STORY:
{full_text}
"""


    response = model.generate_content(prompt)
    return response.text
