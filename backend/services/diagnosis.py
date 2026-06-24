from typing import List, Dict, Any, Optional
from backend.services.calculator import METAL_PROFILES

def diagnose_plating_bath(
    metal_key: str,
    part_type: str,
    problem: Optional[str] = None,
    current_density: Optional[float] = None,
    pH: Optional[float] = None,
    temp: Optional[float] = None
) -> Dict[str, Any]:
    """
    Analyzes bath parameters and defect descriptions to provide industrial troubleshooting advice.
    """
    metal_key = metal_key.lower().strip()
    part_type = part_type.lower().strip()
    problem_key = problem.lower().strip() if problem else None
    
    advice: List[str] = []
    root_causes: List[str] = []
    risk_level = "Low"
    confidence = 0.90
    
    # 1. Load Metal Profile for Reference
    profile = METAL_PROFILES.get(metal_key)
    if not profile:
        return {
            "success": False,
            "advice": ["Unknown metal profile. Please check parameters."],
            "root_causes": ["Parameter mismatch"],
            "risk_level": "High",
            "confidence": 0.50
        }
    
    # 2. Check Standard Operations Deviation
    if current_density is not None:
        if current_density > profile["max_current_density"]:
            advice.append(f"Current density ({current_density} A/dm²) is ABOVE recommended maximum ({profile['max_current_density']} A/dm²) for {profile['name']}. This causes burning at edges.")
            root_causes.append("Excessive current density causing metallic burning.")
            risk_level = "High"
        elif current_density < profile["min_current_density"]:
            advice.append(f"Current density ({current_density} A/dm²) is BELOW recommended minimum ({profile['min_current_density']} A/dm²). This yields dull, thin deposits and poor coverage.")
            root_causes.append("Insufficient current density.")
            
    if pH is not None:
        if pH > profile["max_pH"]:
            advice.append(f"Bath pH ({pH}) is ABOVE the maximum recommended level ({profile['max_pH']}). This leads to chemical imbalances and roughness.")
            root_causes.append("High pH promoting oxide precipitation.")
            risk_level = "Medium" if risk_level == "Low" else risk_level
        elif pH < profile["min_pH"]:
            advice.append(f"Bath pH ({pH}) is BELOW the minimum recommended level ({profile['min_pH']}). This lowers cathode efficiency and increases hydrogen gas evolution (causing pitting).")
            root_causes.append("Low pH inducing excessive hydrogen generation.")
            risk_level = "Medium" if risk_level == "Low" else risk_level
            
    if temp is not None:
        if temp > profile["max_temp"]:
            advice.append(f"Bath temperature ({temp}°C) is ABOVE recommended range ({profile['min_temp']}–{profile['max_temp']}°C). This accelerates brightener depletion and increases deposit tensile stress.")
            root_causes.append("High operating temperature causing organic additive breakdown.")
        elif temp < profile["min_temp"]:
            advice.append(f"Bath temperature ({temp}°C) is BELOW recommended range ({profile['min_temp']}–{profile['max_temp']}°C). This reduces metal ion mobility, narrowing the safe current range.")
            root_causes.append("Low bath temperature restricting current tolerance.")
            risk_level = "Medium" if risk_level == "Low" else risk_level

    # 3. Handle Specific Defect Categories
    if problem_key == "burning":
        risk_level = "High"
        root_causes.append("Concentrated current distribution on sharp points, excessive voltage, or low metal concentration.")
        advice.extend([
            "Decrease rectifier current density by 10-15% dynamically.",
            "Install shielding plates or 'thief' auxiliary cathodes around sharp edges.",
            "Increase agitation rate (air or mechanical cathode movement) to replenish ions at the double layer.",
            "Verify that bath temperature is within the optimum window to increase ion diffusion rates."
        ])
    elif problem_key == "pitting":
        risk_level = "Medium"
        root_causes.append("Hydrogen bubbles sticking to cathode, or organic contamination, or anti-pitting agent depletion.")
        advice.extend([
            "Perform a surface tension test. Replenish anti-pitting agent / surfactant (e.g., Sodium Lauryl Sulfate) to lower surface tension.",
            "Enhance air agitation or cathode rocker speed to mechanically dislodge micro-bubbles from the parts.",
            "Check for organic impurities and schedule a batch active carbon treatment or continuous carbon filtration.",
            "Inspect pre-treatment rinsing to prevent acid/alkaline drag-in that destabilizes surfactants."
        ])
    elif problem_key == "peeling":
        risk_level = "Critical"
        root_causes.append("Poor adhesion due to organic grease, oxide scale, passive substrate, or rinse contamination.")
        advice.extend([
            "Audit the pre-treatment cleaning line. Check alkaline degreasing concentrations and soak times.",
            "Verify acid activation (pickling) strength. Scale/rust must be 100% removed before entry into the plating bath.",
            "Inspect water rinses. Replace contaminated static rinse baths to eliminate soapy drag-in.",
            "Inspect electrical contacts. Intermittent electrical breaks during loading cause laminate/peeled plating."
        ])
    elif problem_key == "dull":
        risk_level = "Medium" if risk_level == "Low" else risk_level
        root_causes.append("Brightener/carrier additive depletion, metallic contamination (e.g., Copper and other active metallic impurities), or low current density.")
        advice.extend([
            "Run a Hull Cell test (1A or 2A) to verify brightener levels and adjust proprietary additives incrementally.",
            "Perform low-current density electrolysis ('dummying') at 0.2-0.5 A/dm² on a corrugated sheet to plate out metallic contaminants.",
            "Check brightener ratio. Excess brightener without carrier can also cause haze or dullness."
        ])

    # 4. Product-Specific Engineering Layouts
    if part_type == "rim":
        advice.append("Motorcycle Rim Tip: High-current density concentrates on rim flanges. Position anodes closer to the rim center or employ shielding blocks.")
    elif part_type == "silencer":
        advice.append("Motorcycle Silencer Tip: Exhaust chambers act as Faraday cages. Use auxiliary internal anodes to achieve deposit coverage inside recessed zones.")
    elif part_type == "handle":
        advice.append("Handlebar Tip: Tube bends cause varying anode-to-cathode distances. Optimize racking rotation angle to equalize distance.")
    elif part_type == "fender":
        advice.append("Fender Tip: Wide flat surfaces require uniform current distribution. Use conforming anode racks to prevent uneven thickness.")

    # 5. Default state
    if not advice:
        advice.append("Bath parameters and part settings are within normal operational limits. Monitor temperature and current density logs.")
        root_causes.append("None detected")
        confidence = 0.98

    # Deduplicate advice
    unique_advice = []
    for item in advice:
        if item not in unique_advice:
            unique_advice.append(item)

    return {
        "success": True,
        "advice": unique_advice,
        "root_causes": list(set(root_causes)),
        "risk_level": risk_level,
        "confidence": confidence
    }
