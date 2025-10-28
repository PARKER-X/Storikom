from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
from api.routes.pdf_extract import extract_text_from_pdf

router = APIRouter()

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        text = extract_text_from_pdf(file)
        return JSONResponse(content={"success": True, "text": text})
    except Exception as e:
        print("⚠️ PDF upload failed:", e)
        return JSONResponse(content={"success": False, "error": str(e)})
