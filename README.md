# BookiFi - AI Novel POV Rewriter

A full-stack web application that allows you to upload a PDF novel, extract characters, generate embeddings, and rewrite the story from any character's point of view. You can also chat with the selected character!

## Features

- 📄 **PDF Upload**: Upload and extract text from PDF files
- 🔍 **Text Extraction**: Extract full text from uploaded PDFs
- 🧠 **Embeddings Generation**: Generate embeddings and store in ChromaDB for semantic search
- 🎭 **Character Extraction**: Automatically extract main characters from the novel
- ✍️ **POV Rewriting**: Rewrite the entire story from a selected character's first-person perspective
- 💬 **Character Chat**: Chat with any extracted character in-character
- 🎨 **Modern UI**: Clean, responsive frontend with beautiful book-themed design

## Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **AI/ML**: 
  - Google Gemini API (for character extraction, rewriting, and chat)
  - Sentence Transformers (for embeddings)
  - ChromaDB (vector database)
- **PDF Processing**: PyMuPDF

## Setup

### Prerequisites

- Python 3.12+
- `uv` package manager (or pip)

### Installation

1. Install dependencies:
```bash
uv sync
# or
pip install -r requirements.txt
```

2. Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

3. Run the FastAPI server:
```bash
uvicorn main:app --reload
# or
python -m uvicorn main:app --reload
```

4. Open your browser and navigate to:
```
http://localhost:8000
```

## API Endpoints

### PDF Operations
- `POST /pdf/extract` - Extract text from uploaded PDF
- `POST /pdf/upload` - Upload PDF (alias for extract)

### Character Operations
- `POST /characters/extract` - Extract characters from text
- `GET /characters/list` - List all characters (placeholder)

### Embeddings
- `POST /embed/generate` - Generate embeddings and save to ChromaDB

### Story Rewriting
- `POST /rewrite/character` - Rewrite story from character's POV
- `POST /rewrite/` - Alias for character rewrite

### Chat
- `POST /chat/character` - Chat with a selected character

## Usage

1. **Upload PDF**: Click "Choose PDF File" and select your novel PDF
2. **Extract Text**: The text is automatically extracted after upload
3. **Generate Embeddings** (Optional): Click "Generate Embeddings" to create vector embeddings
4. **Select Character**: Characters are automatically extracted. Click "Select" on any character card
5. **Rewrite Story**: Click "Rewrite from Character's POV" to generate the rewritten version
6. **Chat**: Use the chat interface to have conversations with the selected character

## Project Structure

```
Bookifi/
├── api/
│   ├── routes/
│   │   ├── pdf_extracter.py    # PDF upload/extract routes
│   │   ├── character.py        # Character extraction routes
│   │   ├── embed.py            # Embedding generation routes
│   │   ├── pov.py              # Story rewriting routes
│   │   ├── chat.py             # Character chat routes
│   │   ├── pdf_extract.py      # PDF text extraction utility
│   │   └── chroma_db.py        # ChromaDB operations
│   └── utils/
│       ├── character_extractor.py  # Character extraction logic
│       ├── pov_rewriter.py         # POV rewriting logic
│       └── chatbot.py              # Character chat logic
├── static/
│   ├── style.css               # Frontend styles
│   └── script.js              # Frontend JavaScript
├── templates/
│   └── index.html             # Main HTML page
├── main.py                    # FastAPI application entry point
└── pyproject.toml             # Project dependencies
```

## Notes

- The application uses Google Gemini API for AI operations. Make sure you have a valid API key.
- Large PDFs may take time to process, especially during rewriting.
- ChromaDB stores embeddings in memory by default. For persistence, configure ChromaDB accordingly.

## License

MIT

