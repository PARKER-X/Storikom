from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
from api.routes.pdf_extract import extract_text_from_pdf

router = APIRouter()

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
<<<<<<< HEAD
    """
    Upload and extract text from PDF.
    """
=======
>>>>>>> 4d03f41741da3cd494cf3ba79950082f672c4a98
    try:
        text = extract_text_from_pdf(file)
        return JSONResponse(content={"success": True, "text": text})
    except Exception as e:
        print("⚠️ PDF upload failed:", e)
        return JSONResponse(content={"success": False, "error": str(e)})
<<<<<<< HEAD

@router.post("/extract")
async def extract_pdf(file: UploadFile = File(...)):
    """
    Extract text from PDF (alias for upload).
    """
    try:
        text = extract_text_from_pdf(file)
        return JSONResponse(content={"success": True, "text": text})
    except Exception as e:
        print("⚠️ PDF extraction failed:", e)
        return JSONResponse(content={"success": False, "error": str(e)})
=======
>>>>>>> 4d03f41741da3cd494cf3ba79950082f672c4a98
