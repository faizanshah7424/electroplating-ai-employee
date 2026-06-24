import re
from typing import Dict, Any, List

DEFECT_DETAILS = {
    "burning": {
        "label": "burning",
        "description": "High-magnification surface analysis reveals granular, dark dendritic growths and crystalline rough deposits clustered around the high-current density extremities (edges and flanges). The micro-structure shows severe thermal stress and metallic oxidation.",
        "mitigation": [
            "Reduce the cathode current density (A/dm²) by 15-20% immediately.",
            "Adjust part positioning on the rack to increase distance from anode edges.",
            "Verify air agitation distribution; increase air pressure to clear the cathode boundary layer.",
            "Install auxiliary robber/thief cathodes or shield plates to divert excess current."
        ]
    },
    "pitting": {
        "label": "pitting",
        "description": "Optical scan detects cluster micro-voids and crater-like depressions (pits) with bright centers. The shape indicates gas bubble adhesion (hydrogen gas pockets) preventing nickel deposition. No signs of particulate roughness.",
        "mitigation": [
            "Add anti-pitting wetting agent (e.g., sodium lauryl sulfate) to decrease bath surface tension.",
            "Increase cathode rod agitation speed to mechanically dislodge micro-bubbles.",
            "Check for organic contaminants and execute active carbon treatment.",
            "Verify bath pH; low pH (<3.5) accelerates hydrogen bubble generation."
        ]
    },
    "peeling": {
        "label": "peeling",
        "description": "Visual diagnostic shows major adhesion failure, manifesting as curled flaking layers of the electrodeposited metal exposing the base steel substrate. Edges show poor shear strength, typical of surface grease or oxide drag-in.",
        "mitigation": [
            "Stop the line and check the pre-treatment degreasing tank concentration, temperature, and soak time.",
            "Audit the hydrochloric acid pickling activation tank; verify acid strength and check for metal buildup.",
            "Implement multi-stage counter-current water rinses to prevent surfactant drag-in.",
            "Check rack contact fingers for rust or loose contact causing intermittent electrical arcs."
        ]
    },
    "dull": {
        "label": "dull",
        "description": "Spectrophotometric reflection analysis indicates low specular gloss and haze across the mid-current density zones. The coating has adequate thickness but lacks grain refinement, indicating brightener depletion.",
        "mitigation": [
            "Perform a Hull Cell test to determine brightener and carrier replenishment volumes.",
            "Check for metallic contamination (e.g., Copper and Iron drag-in) and dummy plate the bath at 0.2 A/dm².",
            "Confirm that bath operating temperature is not exceeding the brightener stability limit (60°C)."
        ]
    },
    "none": {
        "label": "none",
        "description": "Visual and metallurgical scan indicates uniform, high-gloss surface finish. Average surface roughness (Ra) is within tolerance (<0.1 microns). Grain structure is highly refined and free of voids or burning.",
        "mitigation": [
            "Product complies with Quality Assurance standards. Proceed to nickel-chrome duplex transfer or packaging."
        ]
    }
}

def analyze_defect_image(filename: str) -> Dict[str, Any]:
    """
    Parses the filename or contents using keywords to simulate AI image classification.
    """
    filename_lower = filename.lower()
    
    # Try to find keywords in the filename
    detected_defect = "none"
    confidence = 0.96
    
    if "burn" in filename_lower:
        detected_defect = "burning"
        confidence = 0.92
    elif "pit" in filename_lower:
        detected_defect = "pitting"
        confidence = 0.88
    elif "peel" in filename_lower or "flak" in filename_lower:
        detected_defect = "peeling"
        confidence = 0.94
    elif "dull" in filename_lower or "haze" in filename_lower or "cloud" in filename_lower:
        detected_defect = "dull"
        confidence = 0.89
    else:
        # Pseudo-random selection or default to a common defect if not matching "clean" or "good"
        if "clean" in filename_lower or "good" in filename_lower or "perfect" in filename_lower:
            detected_defect = "none"
            confidence = 0.98
        else:
            # Default fallback for testing is none, but let's make it deterministic or slightly varied
            # We will use the length of the filename to choose a defect for testing variability
            defects = ["burning", "pitting", "peeling", "dull", "none"]
            idx = len(filename_lower) % len(defects)
            detected_defect = defects[idx]
            confidence = 0.85 + (len(filename_lower) % 15) / 100.0
            
    details = DEFECT_DETAILS[detected_defect]
    
    return {
        "success": True,
        "defect": details["label"],
        "confidence": round(confidence, 2),
        "description": details["description"],
        "mitigation": details["mitigation"]
    }
