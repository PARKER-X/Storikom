# chatbot.py
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load API key
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


llm = genai.GenerativeModel("gemini-2.5-flash")

def chat_as_character(user_input: str, character_name: str, character_desc: str) -> str:
    """
    Chat with the AI as a specific character.
    """
    if not user_input.strip():
        return "Please provide a message to chat."

    prompt = (
        f"You are {character_name} from a book. "
        f"Your description and traits are: {character_desc}. "
        f"Answer the user as {character_name} would, staying in-character.\n\n"
        f"User: {user_input}\n{character_name}:"
    )

    response = llm.generate_content(prompt)
    return response.text
