from fastapi import APIRouter, File, UploadFile, HTTPException
from backend.schemas.vision import VisionResponse
from backend.services.vision import analyze_defect_image
from backend.utils.logging import get_logger

router = APIRouter()
logger = get_logger("electroplating.api.vision")

@router.post("/detect", response_model=VisionResponse)
async def detect_defect(file: UploadFile = File(...)):
    try:
        logger.info(f"Received visual scan request for file: {file.filename}")
        
        # Validate that the file is an image
        content_type = file.content_type or ""
        if not content_type.startswith("image/") and not any(file.filename.lower().endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".bmp", ".webp"]):
            raise HTTPException(status_code=400, detail="Uploaded file must be a valid image (JPEG, PNG, BMP, WEBP).")
            
        # Simulating file reading and image verification
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")
            
        # File size validation (10MB limit)
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Uploaded file size exceeds the maximum limit of 10MB.")
            
        # Analyze file naming keywords and characteristics to simulate AI defect scanning
        result = analyze_defect_image(file.filename)
        
        return VisionResponse(
            success=True,
            defect=result["defect"],
            confidence=result["confidence"],
            description=result["description"],
            mitigation=result["mitigation"]
        )
        
    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        logger.error(f"Internal error during visual scanning: {str(e)}")
        return VisionResponse(
            success=False,
            defect="none",
            confidence=0.0,
            description=f"System failed to process image scanning due to internal exception: {str(e)}",
            mitigation=["Verify image format and retry. Contact industrial system engineer if issue persists."],
            error=str(e)
        )
