import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from routes.pdf_extract import extract_text_from_pdf
from routes.embed import chunk_text
from routes.chroma_db import embed_and_save
from utils.character_extractor import extract_characters_from_text

# Load your sample PDF
with open("api/tests/sample.pdf", "rb") as f:
    print("📄 Extracting text from PDF...")
    text = extract_text_from_pdf(f)
    print(f"✅ Extracted {len(text)} characters.\n")

print("✂️ Chunking text...")
chunks = chunk_text(text)
print(f"✅ Created {len(chunks)} chunks.\n")

print("📦 Embedding and saving to ChromaDB...")
embed_and_save(chunks, book_id="sample_book")
print("✅ Done! Data stored in ChromaDB.")

# 🧠 Extract characters using Gemini
print("🎭 Extracting characters from book...")
# You can use full text or sample (e.g., only first 5 chunks)
sample_text = " ".join(chunks[:5])
characters = extract_characters_from_text(sample_text)

# ✅ Print characters
print("\n🧾 Characters found:")
for char in characters:
    print(f"- {char['name']}: {char['description']}")
