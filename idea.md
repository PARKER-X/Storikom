# 📚 In Their Shoes: AI-Powered Book Experience

An interactive AI-powered app where users can:
- Upload a book (PDF)
- Choose a character
- Read the story from their perspective
- Chat with them
- Generate AI art for scenes and characters

Built using **free APIs, open-source tools**, and **LLMs**.

---

## 🧱 Tools & Free APIs

| **Function**              | **Tool / Service**                                           | **Cost**      |
|--------------------------|--------------------------------------------------------------|---------------|
| **PDF Text Extraction**  | [`PyMuPDF`](https://pymupdf.readthedocs.io/) / [`pdfplumber`](https://github.com/jsvine/pdfplumber) | ✅ Free       |
| **LLM API (Text/Chat)**  | [**OpenRouter**](https://openrouter.ai/) (Mistral, Claude, GPT-3.5) | ✅ Free Tier  |
| **Embeddings**           | [**Hugging Face Transformers**](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) | ✅ Free       |
| **Vector Database**      | [**ChromaDB (local)**](https://www.trychroma.com/)           | ✅ Free       |
| **Prompt Chaining**      | [**LangChain**](https://www.langchain.com/)                  | ✅ Free       |
| **Image Generation**     | [**Hugging Face Diffusers**](https://huggingface.co/docs/diffusers/index), [**Replicate API**](https://replicate.com/) | ✅ Free Tier  |
| **Frontend / UI**        | [**Streamlit**](https://streamlit.io/)                        | ✅ Free       |
| **Hosting**              | [**Streamlit Community Cloud**](https://streamlit.io/cloud)   | ✅ Free       |

---

## 📁 File Structure

```
ai-story-reader/
├── app.py # Main Streamlit app
├── requirements.txt # Dependencies
├── README.md # Project documentation
├── .streamlit/
│ └── secrets.toml # API keys for deployment
├── utils/
│ ├── pdf_utils.py # PDF text extraction
│ ├── character_extractor.py # Character extraction with LLM
│ ├── pov_rewriter.py # Rewrite scenes from a character's POV
│ ├── chat_character.py # Chat interface with character
│ └── image_generator.py # Generate scene visuals
```


---

## 🛠️ Features

- 📥 Upload any book (PDF)
- 🧠 Extract characters automatically with AI
- 🎭 Choose a character and read story from their POV
- 💬 Chat with characters using AI
- 🖼️ Generate AI-powered visuals for scenes and settings

---

## 🔁 Project Workflow

```mermaid
graph TD
    A[User uploads book PDF] --> B[Extract raw text]
    B --> C[Chunk & index book text]
    C --> D[Run character extraction prompt]
    D --> E[User selects character]
    E --> F[Rewrite story from that character's POV]
    E --> G[Chat with that character]
    F --> H[Generate scene visuals]
    G --> H
