from pydantic import BaseModel, Field
from typing import List, Optional

class VisionResponse(BaseModel):
    success: bool
    defect: str = Field(..., description="Detected defect: burning, pitting, peeling, dull, or none")
    confidence: float = Field(..., ge=0.0, le=1.0, description="AI confidence score")
    description: str = Field(..., description="Detailed description of the visual scan")
    mitigation: List[str] = Field(default=[], description="Recommended immediate actions to correct this defect")
    error: Optional[str] = None
