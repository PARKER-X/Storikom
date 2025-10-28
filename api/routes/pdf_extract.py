import pymupdf  

# def extract_text_from_pdf(file):
#     doc = pymupdf.open(stream=file.read(), filetype="pdf")
#     text = ""
#     for page in doc:
#         text += page.get_text()
#     return text

# import fitz  # PyMuPDF
from io import BytesIO

def extract_text_from_pdf(file):
    """
    Extracts text from PDF whether it's a FastAPI UploadFile or Streamlit BytesIO.
    """
    try:
        # Handle FastAPI UploadFile
        if hasattr(file, "file"):
            file_bytes = file.file.read()

        # Handle Streamlit file_uploader BytesIO
        elif hasattr(file, "read"):
            file_bytes = file.read()

        else:
            raise ValueError("Unsupported file type passed to extract_text_from_pdf")

        # Ensure not empty
        if not file_bytes:
            raise ValueError("Uploaded file is empty or unreadable")

        # Read with PyMuPDF
        pdf = pymupdf.open(stream=file_bytes, filetype="pdf")
        text = ""
        for page in pdf:
            text += page.get_text("text")
        pdf.close()

        return text.strip()

    except Exception as e:
        print("❌ PDF extraction failed:", e)
        raise e
