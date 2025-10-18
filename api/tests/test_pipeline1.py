import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from routes.pdf_extract import extract_text_from_pdf
from routes.embed import chunk_text
from routes.chroma_db import embed_and_save


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
