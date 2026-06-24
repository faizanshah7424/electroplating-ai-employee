from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ProcessRequest(BaseModel):
    part: str = Field(..., description="Type of part, e.g., rim, silencer, handle, fender")
    metal: str = Field(default="bright_nickel", description="Plating metal: semi_bright_nickel, bright_nickel, chrome")
    area: float = Field(..., gt=0, description="Surface area of the part in dm²")
    thickness: float = Field(default=20.0, gt=0, description="Plating thickness in microns (µm)")
    current_density: float = Field(..., gt=0, description="Current density in A/dm²")
    problem: Optional[str] = Field(default=None, description="Active defect: burning, pitting, peeling, dull")
    pH: Optional[float] = Field(default=None, description="Measured bath pH")
    temp: Optional[float] = Field(default=None, description="Measured bath temperature in °C")
    efficiency: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Cathode current efficiency (0.0 to 1.0)")

class ProcessResponse(BaseModel):
    success: bool
    time_minutes: float
    total_current_amps: float
    deposited_mass_grams: float
    advice: List[str]
    inputs: Dict[str, Any]
    error: Optional[str] = None
