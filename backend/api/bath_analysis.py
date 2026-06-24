from fastapi import APIRouter, HTTPException
from backend.schemas.bath import BathAnalysisRequest, BathAnalysisResult, LineAnalysisRequest, LineAnalysisResponse
from backend.services.line_diagnostics import analyze_single_bath, analyze_complete_line
from backend.utils.logging import get_logger

router = APIRouter(prefix="/analyze-line", tags=["Line Analysis"])
logger = get_logger("electroplating.api.bath_analysis")

@router.post("/bath", response_model=BathAnalysisResult)
def analyze_bath_endpoint(request: BathAnalysisRequest):
    try:
        logger.info(f"Analyzing bath: {request.bath_type} for part: {request.part_type}")
        result = analyze_single_bath(
            bath_type=request.bath_type,
            part_type=request.part_type,
            parameters=request.parameters,
            problem_symptom=request.problem_symptom
        )
        return result
    except Exception as e:
        logger.error(f"Error analyzing single bath: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/line", response_model=LineAnalysisResponse)
def analyze_line_endpoint(request: LineAnalysisRequest):
    try:
        logger.info(f"Analyzing complete electroplating line for part: {request.part_type}")
        result = analyze_complete_line(request)
        return result
    except Exception as e:
        logger.error(f"Error analyzing production line: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
