import google.generativeai as genai
from langchain.vectorstores import Chroma
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.llms import GoogleGenerativeAI
from langchain.chains.question_answering import load_qa_chain
import os 
from dotenv import load_dotenv
import google.generativeai as genai

# Load Gemini API key
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
# Load Gemini model
model = genai.GenerativeModel("gemini-2.5-flash")
def get_llm():
    return GoogleGenerativeAI(model="gemini-pro", temperature=0.7)

# Load vectorstore and retrieve similar chunks
def retrieve_relevant_chunks(query, chroma_db_path="./chroma_db"):
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vectordb = Chroma(persist_directory=chroma_db_path, embedding_function=embeddings)
    docs = vectordb.similarity_search(query, k=4)
    return docs

# Create prompt and rewrite the story
def rewrite_scene_from_pov(character_name, traits, scene_query, chroma_db_path="./chroma_db"):
    llm = get_llm()
    chain = load_qa_chain(llm, chain_type="stuff")
    
    docs = retrieve_relevant_chunks(scene_query, chroma_db_path)

    prompt = (
        f"You are {character_name}, a character with the following traits: {traits}.\n"
        "Rewrite the following scene or story fragments from your own point of view. "
        "Keep the tone and emotions aligned with your character. Include thoughts, feelings, and hidden motivations.\n"
        f"Scene description: {scene_query}\n\n"
        "Story fragments:\n"
    )

    # Combine the docs for input
    context = "\n\n".join([doc.page_content for doc in docs])
    input_text = prompt + context

    result = chain.run(input_documents=docs, question=prompt)
    return result
