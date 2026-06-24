from fastapi import APIRouter, HTTPException
from backend.schemas.process import ProcessRequest, ProcessResponse
from backend.services.calculator import calculate_plating_parameters
from backend.services.diagnosis import diagnose_plating_bath
from backend.utils.logging import get_logger

router = APIRouter()
logger = get_logger("electroplating.api.process")

@router.post("/analyze", response_model=ProcessResponse)
def analyze_process(request: ProcessRequest):
    try:
        logger.info(f"Processing plating request: Metal={request.metal}, Part={request.part}, Area={request.area}dm²")
        
        # 1. Run physical calculations
        calc_result = calculate_plating_parameters(
            metal_key=request.metal,
            area_dm2=request.area,
            current_density_adm2=request.current_density,
            thickness_microns=request.thickness,
            efficiency_override=request.efficiency
        )
        
        # 2. Run rule-based bath diagnostics
        diag_result = diagnose_plating_bath(
            metal_key=request.metal,
            part_type=request.part,
            problem=request.problem,
            current_density=request.current_density,
            pH=request.pH,
            temp=request.temp
        )
        
        # Merge physical advice with diagnostic advice
        combined_advice = diag_result["advice"]
        
        # Add basic current validation warning directly to advice
        cd_limit = calc_result["profile"]
        if request.current_density > cd_limit["max_current_density"]:
            combined_advice.insert(0, f"CRITICAL: Current density exceeding safety limit. Reduce to avoid burning.")
            
        inputs = {
            "part": request.part,
            "metal": request.metal,
            "area": request.area,
            "thickness": request.thickness,
            "current_density": request.current_density,
            "pH": request.pH,
            "temperature": request.temp
        }
        
        return ProcessResponse(
            success=True,
            time_minutes=calc_result["time_minutes"],
            total_current_amps=calc_result["total_current_amps"],
            deposited_mass_grams=calc_result["deposited_mass_grams"],
            advice=combined_advice,
            inputs=inputs
        )
        
    except ValueError as val_err:
        logger.error(f"Validation error in process analysis: {str(val_err)}")
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as e:
        logger.error(f"Internal error in process analysis: {str(e)}")
        return ProcessResponse(
            success=False,
            time_minutes=0.0,
            total_current_amps=0.0,
            deposited_mass_grams=0.0,
            advice=["Internal system error processing request."],
            inputs={},
            error=str(e)
        )
