import streamlit as st
from routes.pdf_extract import extract_text_from_pdf
# from routes.embed import chunk_text
# from routes.chroma_db import embed_and_save, collection
from utils.character_extractor import extract_characters_from_text
from utils.pov_rewriter import rewrite_story_from_pov
from utils.chatbot import chat_as_character

st.set_page_config(page_title="BookiFi: AI Book POV Rewriter", layout="wide")
st.title("📚 BookiFi: Rewrite Novel From a Character's Point of View")

# Step 1: Upload PDF
uploaded_file = st.file_uploader("Upload your book (PDF)", type=["pdf"])

if uploaded_file:
    # Step 2: Extract text
    with st.spinner("📄 Extracting text from PDF..."):
        full_text = extract_text_from_pdf(uploaded_file)

    st.success("✅ Text extracted successfully!")
    st.session_state["book_text"] = full_text

    # # Step 3: Chunk + Embed (Optional)
    # if st.button("🔍 (Optional) Embed text into ChromaDB"):
    #     with st.spinner("Chunking and indexing..."):
    #         chunks = chunk_text(full_text)
    #         embed_and_save(chunks, book_id="book1")
    #     st.success("✅ Embedded and saved!")

    # Step 4: Extract Characters
    if st.button("🎭 Extract Characters"):
        with st.spinner("Extracting characters..."):
            characters = extract_characters_from_text(full_text)
            if characters:
                st.session_state["characters"] = characters
                st.success(f"✅ Found {len(characters)} characters!")
            else:
                st.warning("No characters found.")

    # Step 5: Character Selection
    if "characters" in st.session_state:
        st.subheader("Select a Character")
        char_names = [c["name"] for c in st.session_state["characters"]]
        selected_char = st.selectbox("Choose character for POV rewriting:", char_names)

        selected_desc = next(
            (c["description"] for c in st.session_state["characters"] if c["name"] == selected_char),
            ""
        )

        # Step 6: Rewrite Entire Book from POV
        if st.button(f"✍️ Rewrite Entire Book from {selected_char}'s POV"):
            with st.spinner("Rewriting story... this may take a moment..."):
                rewritten = rewrite_story_from_pov(
                    character_name=selected_char,
                    traits=selected_desc,
                    full_text=st.session_state["book_text"]
                )
                st.markdown(f"### 📝 Rewritten Story from {selected_char}'s POV")
                st.write(rewritten)

                # Option to download
                st.download_button(
                    label="📥 Download Story as .txt",
                    data=rewritten,
                    file_name=f"{selected_char}_POV_story.txt",
                    mime="text/plain"
                )
    st.markdown("---")
    st.subheader(f"💬 Chat as {selected_char}")

    user_input = st.text_input("Ask a question or talk to the character:")

    if st.button("Send Chat"):
        if user_input.strip() == "":
            st.warning("Please enter a question first.")
        else:
            with st.spinner(f"💡 {selected_char} is responding..."):
                ai_reply = chat_as_character(user_input, selected_char, selected_desc)
                st.markdown(f"**{selected_char}:** {ai_reply}")