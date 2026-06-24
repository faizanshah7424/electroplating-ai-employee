from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class BathAnalysisRequest(BaseModel):
    bath_type: str = Field(..., description="Bath key: caustic_cleaning, acid_activation, semi_bright_nickel, bright_nickel, chrome_plating")
    part_type: str = Field(default="rim", description="Part: rim, silencer, handle, fender")
    parameters: Dict[str, float] = Field(..., description="Dict of chemical parameters, e.g., {'ph': 4.2, 'temp': 55.0, ...}")
    problem_symptom: Optional[str] = Field(default=None, description="Reported symptom: burning, pitting, peeling, dull, streaks, coverage, scales, oil")

class BathAnalysisResult(BaseModel):
    bath: str = Field(..., description="Standard bath name")
    status: str = Field(..., description="Optimal, Warning, or Critical")
    issues: List[str] = Field(default=[], description="Anomalies detected")
    root_causes: List[str] = Field(default=[], description="Metallurgical/Chemical root causes")
    recommendations: List[str] = Field(default=[], description="Corrective engineering steps")
    confidence: float = Field(..., description="Diagnosis confidence rating")

class LineAnalysisRequest(BaseModel):
    part_type: str = Field(default="rim", description="Component type: rim, silencer, handle, fender")
    caustic_cleaning: Optional[Dict[str, float]] = Field(default=None, description="NaOH conc, temp, time")
    acid_activation: Optional[Dict[str, float]] = Field(default=None, description="H2SO4 conc, temp, time")
    semi_bright_nickel: Optional[Dict[str, float]] = Field(default=None, description="Ni sulfate, Ni chloride, boric acid, ph, temp, current_density")
    bright_nickel: Optional[Dict[str, float]] = Field(default=None, description="brightener, Ni sulfate, Ni chloride, boric acid, ph, temp, current_density")
    chrome_plating: Optional[Dict[str, float]] = Field(default=None, description="chromic_acid, sulfate_ratio, temp, current_density")
    problem_symptom: Optional[str] = Field(default=None, description="Line defect reported at final inspection")

class LineAnalysisResponse(BaseModel):
    success: bool
    line_status: str = Field(..., description="Optimal, Warning, or Critical")
    baths: List[BathAnalysisResult] = Field(default=[])
    overall_predicted_defects: List[str] = Field(default=[])
    overall_recommendations: List[str] = Field(default=[])
    confidence: float = Field(..., description="Overall confidence rating")
