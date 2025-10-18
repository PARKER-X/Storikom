from sentence_transformers import SentenceTransformer
import chromadb

# Load embedding model
embedder = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# Connect to ChromaDB
chroma_client = chromadb.Client()
collection = chroma_client.get_or_create_collection("books")

def embed_and_save(chunks, book_id):
    embeddings = embedder.encode(chunks).tolist()
    collection.add(
        documents=chunks,
        embeddings=embeddings,
        ids=[f"{book_id}_{i}" for i in range(len(chunks))]
    )
