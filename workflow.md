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


## Structure

BookiFi/
│
├── .env                        # API keys, secrets
├── .gitignore
├── main.py                    # Streamlit app entry point
├── idea.md                    # Project description (as seen)
├── workflow.md                # Detailed step-by-step workflow
├── requirements.txt           # All dependencies

│
├── 📁 api/                     # API routes (if using FastAPI or modular logic)
│   ├── routes/
│   │   ├── pdf_extract.py     # PDF text extraction logic
│   │   ├── embed.py           # Embedding & vector DB logic
│   │   ├── chroma_db.py       # ChromaDB helper (load/store chunks)
│   │   ├── character.py       # Character logic
│   │   ├── pdf_extracter.py   # Pdf upload logic
│   │   ├── pov.py             # Charcter Pov logic
│
├── 📁 utils/                   # Utility functions (LLM interaction, prompts, etc.)
│   ├── character_extractor.py # Uses LLM to extract characters + traits
│   ├── pov_rewriter.py        # Rewrites story from character POV
│   └── chatbot.py             # Handles character chat
│
├── 📁 tests/                   # For testing modules (unit or integration)
│   ├── sample.pdf             # Demo novel for dev/testing
│   ├── test_pipeline1.py
│   └── test2.py
│
├── 📁 static                 # For js/css
│   ├── js                     # Js file
│   ├── css                    # css file
│   
├── 📁 templated              # For frontend
│   ├── index.html             # html file
│   
├── 📁 chroma_db/              # Local vector store (auto created by Chroma)
│   └── index data
│
├── 📁 .venv/                   # Virtual environment (hidden from Git)
└──
