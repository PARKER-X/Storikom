🔄 Step-by-Step Workflow
1. 📥 Upload PDF Book

Component: app.py (Streamlit upload widget)

Description: User uploads a book in PDF format through the frontend.

Output: PDF file passed to text extraction module.

2. 📄 Extract Raw Text from PDF

Module: utils/pdf_utils.py

Tool: PyMuPDF or pdfplumber

Steps:

Load PDF

Iterate through pages

Extract and clean text

Output: Full book text as a string

3. 📚 Chunk and Index Book Text

Tool: LangChain, HuggingFace Embeddings, ChromaDB

Steps:

Split text into manageable chunks (e.g. 500 tokens each)

Embed chunks using all-MiniLM-L6-v2

Store embeddings locally using ChromaDB

Purpose: Enable fast similarity search for later interactions

4. 🎭 Extract Characters from the Book

Module: utils/character_extractor.py

Tool: OpenRouter LLM (e.g., Claude, GPT-3.5)

Prompting Strategy:

Ask LLM to list main characters with short descriptions

Optionally include relationships or personality traits

Output: List of characters for user to choose from

5. 👤 User Selects a Character

Component: app.py UI

Description: User is shown a list of characters and selects one

Output: Selected character passed to POV and chat modules

6. ✍️ Rewrite Story from Selected Character’s POV

Module: utils/pov_rewriter.py

Tool: LLM via OpenRouter

Steps:

Retrieve relevant chunks using similarity search

Prompt LLM to rewrite selected scenes from chosen character’s point of view

Keep voice, emotions, and motivations aligned with character profile

Output: Narrative text shown to the user

7. 💬 Chat with the Character

Module: utils/chat_character.py

Tool: LLM (via OpenRouter with persona prompt)

Steps:

Load character description and context

Maintain chat history

Prompt LLM to reply in character

Output: Interactive conversation window with character

8. 🖼️ Generate AI Visuals for Scenes or Characters

Module: utils/image_generator.py

Tools:

Hugging Face Diffusers (Stable Diffusion)

OR Replicate API (for more complex models)

Steps:

Use rewritten POV or user prompt to generate scene/character descriptions

Generate an image via selected image model

Output: AI-generated art shown in the app


--------------------------------------------------

🚀 Flow Summary

From PDF to AI-powered immersion
Upload → Extract → Index → Choose Character → Rewrite Scenes → Chat → Visualize