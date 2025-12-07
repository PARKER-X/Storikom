import google.generativeai as genai
import os
from dotenv import load_dotenv
import textwrap

# Load Gemini API key
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")

# def chunk_text(text, max_chunk_size=3500):
#     """
#     Split the text into chunks of approximately max_chunk_size characters,
#     breaking at sentence boundaries for cleaner splits.
#     """
#     sentences = text.split('. ')
#     chunks = []
#     current_chunk = ""
#     for sentence in sentences:
#         if len(current_chunk) + len(sentence) + 2 <= max_chunk_size:
#             current_chunk += sentence + ". "
#         else:
#             chunks.append(current_chunk.strip())
#             current_chunk = sentence + ". "
#     if current_chunk:
#         chunks.append(current_chunk.strip())
#     return chunks

def chunk_text(text, min_chunks=25, max_chunks=52):
    """
    Split text into smaller chunks dynamically.
    - Ensures each chunk is ~1/52 to 1/25 of total text length.
    """
    total_length = len(text)
    
    # Decide chunk size
    max_chunk_size = max(total_length // min_chunks, 500)  # Avoid tiny chunks <500 chars
    min_chunk_size = total_length // max_chunks

    sentences = text.split('. ')
    chunks = []
    current_chunk = ""

    for sentence in sentences:
        if len(current_chunk) + len(sentence) + 2 <= max_chunk_size:
            current_chunk += sentence + ". "
        else:
            if len(current_chunk) >= min_chunk_size:
                chunks.append(current_chunk.strip())
                current_chunk = sentence + ". "
            else:
                # If current chunk is too small, merge
                current_chunk += sentence + ". "
    
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    return chunks


def rewrite_chunk_from_pov(character_name, traits, chunk_text, chunk_number):
    """
    Rewrite a chunk of story text from the character's POV with rich detail.
    """
    prompt = f"""
You are **{character_name}**, a major character in the story below.

Your traits and personality are as follows: {traits}.

Rewrite the following **part of the story** from your **first-person point of view**. Follow these instructions carefully:

- Use **first-person narration** as if you are living each moment.
- Begin by briefly reminding the reader of your **background and beliefs** relevant to this part.
- For every event, describe your **sensations, emotions, fears, hopes, pain, anger, love, jealousy, pride** — your full emotional truth.
- Include **detailed scenes, dialogues, and inner monologues** that reveal your character deeply.
- Describe how you **perceive other characters and their actions**, emphasizing your subjective perspective.
- Show your **emotional and mental evolution** through these events.
- This is **not a summary**; it should be a rich, immersive retelling in your voice.
- End this part with your personal reflection or emotional state.

---

### Part {chunk_number} of the story:

{chunk_text}
"""

    response = model.generate_content(prompt)
    return response.text

<<<<<<< HEAD
def rewrite_story_from_pov(character_name, traits, full_text, min_chunks=25, max_chunks=52):
    """
    Rewrite the entire story by chunking it and rewriting each chunk from the character's POV.
    """
    chunks = chunk_text(full_text, min_chunks=min_chunks, max_chunks=max_chunks)
=======
def rewrite_story_from_pov(character_name, traits, full_text, max_chunk_size=3500):
    """
    Rewrite the entire story by chunking it and rewriting each chunk from the character's POV.
    """
    chunks = chunk_text(full_text, max_chunk_size)
>>>>>>> 4d03f41741da3cd494cf3ba79950082f672c4a98
    rewritten_parts = []
    
    for i, chunk in enumerate(chunks, start=1):
        print(f"Rewriting chunk {i}/{len(chunks)}...")  # Optional: progress feedback
        rewritten_chunk = rewrite_chunk_from_pov(character_name, traits, chunk, i)
        rewritten_parts.append(rewritten_chunk)
    
    return "\n\n".join(rewritten_parts)

