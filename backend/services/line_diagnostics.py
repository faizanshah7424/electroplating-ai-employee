from typing import Dict, Any, List, Optional
from backend.knowledge_base.electroplating_kb import BATH_STANDARDS
from backend.schemas.bath import BathAnalysisResult, LineAnalysisResponse

def diagnose_caustic_cleaning(
    part_type: str, 
    params: Dict[str, float], 
    problem_symptom: Optional[str]
) -> BathAnalysisResult:
    issues = []
    root_causes = []
    recs = []
    status = "Optimal"
    confidence = 0.95
    
    std = BATH_STANDARDS["caustic_cleaning"]["chemistry"]
    naoh = params.get("naoh_conc", std["naoh_conc"]["optimal"])
    temp = params.get("temp", std["temp"]["optimal"])
    time = params.get("time", std["time"]["optimal"])
    
    # 1. NaOH Conc Check
    if naoh < std["naoh_conc"]["min"]:
        status = "Warning"
        issues.append(f"Low NaOH concentration: {naoh} g/L (Min: {std['naoh_conc']['min']} g/L)")
        root_causes.append("Insufficient saponification of animal/vegetable grease and poor mineral oil emulsification.")
        recs.append("Add Sodium Hydroxide (NaOH) chemical flakes to restore bath concentration to 70 g/L.")
    elif naoh > std["naoh_conc"]["max"]:
        issues.append(f"High NaOH concentration: {naoh} g/L (Max: {std['naoh_conc']['max']} g/L)")
        root_causes.append("Increased chemical drag-out loss and excessive rinsing requirements; hazard of substrate pitting.")
        recs.append("Dilute caustic bath with deionized water to prevent unnecessary chemical carryover.")

    # 2. Temperature Check
    if temp < std["temp"]["min"]:
        status = "Critical" if status == "Optimal" or status == "Warning" else status
        issues.append(f"Low bath temperature: {temp}°C (Min: {std['temp']['min']}°C)")
        root_causes.append("Fats and heavy polishing compounds on rims/handles do not melt or dissolve, leaving hydrophobic grease films.")
        recs.append("Check steam lines or electric immersion heaters. Restore operating temperature to 70°C.")
    elif temp > std["temp"]["max"]:
        issues.append(f"High bath temperature: {temp}°C (Max: {std['temp']['max']}°C)")
        root_causes.append("Excessive steam losses, accelerated water evaporation, and risk of caustic solution drying on parts during transfer.")
        recs.append("Reduce heating setpoint to maintain temperature between 60°C and 80°C.")

    # 3. Immersion Time Check
    if time < std["time"]["min"]:
        status = "Warning" if status == "Optimal" else status
        issues.append(f"Short cleaning time: {time} min (Min: {std['time']['min']} min)")
        root_causes.append("Incomplete oil displacement in recessed zones (especially inside silencer chambers or handle tube bends).")
        recs.append("Adjust conveyor line speed or manual timing to ensure a minimum 5-minute soak.")

    # 4. Symptom Check
    if problem_symptom in ["peeling", "oil", "scales"]:
        status = "Critical"
        issues.append("Water-break or oil slicks detected on part surfaces.")
        root_causes.append("Surface grease drag-in resulting in lack of molecular bonding during subsequent nickel layers.")
        recs.append("Perform a water-break test after rinsing. Check caustic bath surface for floating oil; install oil skimmer.")

    if status != "Optimal":
        confidence = 0.90
        
    return BathAnalysisResult(
        bath="Caustic Cleaning",
        status=status,
        issues=issues,
        root_causes=root_causes,
        recommendations=recs if recs else ["Caustic cleaning parameters are within specification. Maintain standard monitoring."],
        confidence=confidence
    )


def diagnose_acid_activation(
    part_type: str, 
    params: Dict[str, float], 
    problem_symptom: Optional[str]
) -> BathAnalysisResult:
    issues = []
    root_causes = []
    recs = []
    status = "Optimal"
    confidence = 0.95
    
    std = BATH_STANDARDS["acid_activation"]["chemistry"]
    h2so4 = params.get("h2so4_conc", std["h2so4_conc"]["optimal"])
    temp = params.get("temp", std["temp"]["optimal"])
    time = params.get("time", std["time"]["optimal"])
    
    # 1. H2SO4 Conc Check
    if h2so4 < std["h2so4_conc"]["min"]:
        status = "Warning"
        issues.append(f"Low H2SO4 concentration: {h2so4}% (Min: {std['h2so4_conc']['min']}%)")
        root_causes.append("Weak acid pickling. Fails to dissolve micro-scale rust, welding oxides, and passivations on steel.")
        recs.append("Replenish sulfuric acid concentration to 8% v/v by adding concentrated H2SO4.")
    elif h2so4 > std["h2so4_conc"]["max"]:
        issues.append(f"High H2SO4 concentration: {h2so4}% (Max: {std['h2so4_conc']['max']}%)")
        root_causes.append("Excessive substrate corrosion and atomic hydrogen absorption (promoting hydrogen embrittlement).")
        recs.append("Dilute pickling tank with deionized water; check carbon steel parts for black smut residues.")

    # 2. Time Check
    if time < std["time"]["min"]:
        status = "Warning" if status == "Optimal" else status
        issues.append(f"Short activation duration: {time} sec (Min: {std['time']['min']} sec)")
        root_causes.append("Under-pickled surfaces; native iron oxide layers remain intact, preventing plating adhesion.")
        recs.append("Increase immersion time in sulfuric acid tank to 60 seconds.")
    elif time > std["time"]["max"]:
        status = "Critical"
        issues.append(f"Excessive activation duration: {time} sec (Max: {std['time']['max']} sec)")
        root_causes.append("Over-pickling. Dissolves base iron while leaving insoluble carbon smut (black powder) on surface, causing blistering/peeling.")
        recs.append("Reduce sulfuric acid tank immersion. If parts are highly rusted, mechanically scrub before entry.")

    # 3. Temperature Check
    if temp > std["temp"]["max"]:
        status = "Warning" if status != "Critical" else status
        issues.append(f"Elevated pickling temperature: {temp}°C (Max: {std['temp']['max']}°C)")
        root_causes.append("Warm acid accelerates substrate attack, yielding rough etching and smut.")
        recs.append("Pickling should occur at ambient temperature. Let tank cool or check heat exchangers.")

    if problem_symptom in ["peeling", "blisters"]:
        status = "Critical"
        issues.append("Peeling or blistered plating reported.")
        root_causes.append("Lack of substrate activation or presence of carbon smut preventing nickel nucleation.")
        recs.append("Audit pickling quality. Scrub smut off parts. Ensure activation rinse is clean and uncontaminated.")

    if status != "Optimal":
        confidence = 0.92
        
    return BathAnalysisResult(
        bath="Sulfuric Acid Activation",
        status=status,
        issues=issues,
        root_causes=root_causes,
        recommendations=recs if recs else ["Substrate activation parameters optimal. Monitor rinse quality."],
        confidence=confidence
    )


def diagnose_semi_bright_nickel(
    part_type: str, 
    params: Dict[str, float], 
    problem_symptom: Optional[str]
) -> BathAnalysisResult:
    issues = []
    root_causes = []
    recs = []
    status = "Optimal"
    confidence = 0.95
    
    std = BATH_STANDARDS["semi_bright_nickel"]["chemistry"]
    sulfate = params.get("ni_sulfate", std["ni_sulfate"]["optimal"])
    chloride = params.get("ni_chloride", std["ni_chloride"]["optimal"])
    boric = params.get("boric_acid", std["boric_acid"]["optimal"])
    ph = params.get("ph", std["ph"]["optimal"])
    temp = params.get("temp", std["temp"]["optimal"])
    cd = params.get("current_density", std["current_density"]["optimal"])
    
    # 1. Chemical Concentrations
    if sulfate < std["ni_sulfate"]["min"]:
        status = "Warning"
        issues.append(f"Low Nickel Sulfate: {sulfate} g/L (Min: {std['ni_sulfate']['min']} g/L)")
        root_causes.append("Depleted metal source, restricting maximum operating current density and increasing high-current burning risk.")
        recs.append("Replenish Nickel Sulfate salts to target 280 g/L.")
        
    if chloride < std["ni_chloride"]["min"]:
        status = "Warning"
        issues.append(f"Low Nickel Chloride: {chloride} g/L (Min: {std['ni_chloride']['min']} g/L)")
        root_causes.append("Poor nickel anode dissolution, causing anode passivation and raising cell voltage.")
        recs.append("Add Nickel Chloride to improve anode efficiency and maintain bath conductivity.")
    elif chloride > std["ni_chloride"]["max"]:
        issues.append(f"High Nickel Chloride: {chloride} g/L (Max: {std['ni_chloride']['max']} g/L)")
        root_causes.append("Increases deposit tensile stress, contributing to peeling and cracking under stress.")
        recs.append("Dilute the bath or allow natural drag-out to reduce chloride levels.")

    if boric < std["ni_boric_acid"]["min"] if "ni_boric_acid" in std else boric < 35.0:
        status = "Critical"
        issues.append(f"Low Boric Acid: {boric} g/L (Min: 35.0 g/L)")
        root_causes.append("Depleted pH buffering capacity in cathode film. Promotes local pH spikes, causing nickel hydroxide burning and pitting.")
        recs.append("Add Boric Acid immediately to reach 40 g/L. Maintain chemical buffer levels.")

    # 2. Operating Conditions
    if ph < std["ph"]["min"]:
        status = "Warning" if status != "Critical" else status
        issues.append(f"Low pH: {ph} (Min: {std['ph']['min']})")
        root_causes.append("Accelerates hydrogen gas evolution, decreasing current efficiency and causing pitting defects.")
        recs.append("Raise pH incrementally by adding Nickel Carbonate paste; do not use NaOH.")
    elif ph > std["ph"]["max"]:
        status = "Warning" if status != "Critical" else status
        issues.append(f"High pH: {ph} (Max: {std['ph']['max']})")
        root_causes.append("Induces precipitation of basic nickel salts in the diffusion layer, leading to rough, brittle coatings.")
        recs.append("Add dilute Sulfuric Acid (10% solution) to lower pH to 4.2.")

    if temp < std["temp"]["min"]:
        status = "Warning" if status != "Critical" else status
        issues.append(f"Low Temperature: {temp}°C (Min: {std['temp']['min']}°C)")
        root_causes.append("Decreased ion mobility and salt solubility, leading to high-current area burning.")
        recs.append("Turn on bath steam/heating elements to reach 55°C.")
        
    if cd > std["current_density"]["max"]:
        status = "Warning" if status != "Critical" else status
        issues.append(f"High Current Density: {cd} A/dm² (Max: {std['current_density']['max']} A/dm²)")
        root_causes.append("Exceeds standard deposition capacity, causing rough, burnt nickel at high-current areas (e.g. rim flanges).")
        recs.append("Reduce rectifier current setting.")

    # 3. Symptom checks
    if problem_symptom == "burning":
        status = "Warning" if status == "Optimal" else status
        issues.append("Edge burning reported.")
        root_causes.append("High current density at part extremities or low metal temperature.")
        recs.append("Decrease rectifier output. Check rack positioning; apply shield plates or thief wires.")
    elif problem_symptom == "pitting":
        status = "Warning" if status == "Optimal" else status
        issues.append("Pitting holes detected on nickel deposit.")
        root_causes.append("Hydrogen bubble encapsulation or organic contamination.")
        recs.append("Increase mechanical agitation. Audit surfactant levels. Perform carbon filtration if organic impurities are suspected.")
    elif problem_symptom == "peeling":
        status = "Critical"
        issues.append("Peeling / Adhesion failure reported.")
        root_causes.append("Drag-in contamination or poor clean pre-treatment.")
        recs.append("Ensure activation HCl/H2SO4 rinse is clean. Investigate pre-treatment caustic cleaning line.")

    if status != "Optimal":
        confidence = 0.90
        
    return BathAnalysisResult(
        bath="Semi-Bright Nickel",
        status=status,
        issues=issues,
        root_causes=root_causes,
        recommendations=recs if recs else ["Semi-bright nickel bath parameters stable. Keep monitoring buffer levels."],
        confidence=confidence
    )


def diagnose_bright_nickel(
    part_type: str, 
    params: Dict[str, float], 
    problem_symptom: Optional[str]
) -> BathAnalysisResult:
    issues = []
    root_causes = []
    recs = []
    status = "Optimal"
    confidence = 0.95
    
    std = BATH_STANDARDS["bright_nickel"]["chemistry"]
    brightener = params.get("brightener", std["brightener"]["optimal"])
    sulfate = params.get("ni_sulfate", std["ni_sulfate"]["optimal"])
    chloride = params.get("ni_chloride", std["ni_chloride"]["optimal"])
    boric = params.get("boric_acid", std["boric_acid"]["optimal"])
    ph = params.get("ph", std["ph"]["optimal"])
    temp = params.get("temp", std["temp"]["optimal"])
    cd = params.get("current_density", std["current_density"]["optimal"])
    
    # 1. Brightener Check
    if brightener < std["brightener"]["min"]:
        status = "Warning"
        issues.append(f"Low Brightener additive: {brightener} mL/L (Min: {std['brightener']['min']} mL/L)")
        root_causes.append("Insufficient grain boundary refinement, yielding hazy, dull, or cloudy nickel zones.")
        recs.append("Replenish primary brightener and carrier level to 1.5 mL/L based on a Hull Cell panel test.")
    elif brightener > std["brightener"]["max"]:
        status = "Critical"
        issues.append(f"Excessive Brightener additive: {brightener} mL/L (Max: {std['brightener']['max']} mL/L)")
        root_causes.append("Co-deposition of excessive organic sulfur increases tensile stress, inducing brittle deposits and peeling.")
        recs.append("Stop brightener additions. Dummy plate the bath at 0.5 A/dm² or execute active carbon treatment to absorb organics.")

    # 2. General Watts Chemistry
    if sulfate < std["ni_sulfate"]["min"]:
        issues.append(f"Low Nickel Sulfate: {sulfate} g/L (Min: {std['ni_sulfate']['min']} g/L)")
        root_causes.append("Limitation of nickel metal carrier capacity, causing current burning at high zones.")
        recs.append("Add Nickel Sulfate to reach 270 g/L.")
        
    if chloride < std["ni_chloride"]["min"]:
        issues.append(f"Low Nickel Chloride: {chloride} g/L (Min: {std['ni_chloride']['min']} g/L)")
        root_causes.append("Anode passivation, causing voltage buildup and depletion of nickel metal levels.")
        recs.append("Add Nickel Chloride to restore anode activation.")

    if boric < 35.0:
        status = "Critical"
        issues.append(f"Low Boric Acid buffer: {boric} g/L (Min: 35.0 g/L)")
        root_causes.append("Boric acid depletion allows high pH drift at cathode layer, causing roughness and pitting.")
        recs.append("Add Boric Acid salts to reach 40 g/L.")

    # 3. Temperature / pH / CD Checks
    if ph < std["ph"]["min"]:
        status = "Warning" if status != "Critical" else status
        issues.append(f"Low pH: {ph} (Min: {std['ph']['min']})")
        root_causes.append("High hydrogen gas generation, causing deposit pitting.")
        recs.append("Add Nickel Carbonate to neutralize acidity and raise pH to 4.4.")
    elif ph > std["ph"]["max"]:
        status = "Warning" if status != "Critical" else status
        issues.append(f"High pH: {ph} (Max: {std['ph']['max']})")
        root_causes.append("Basic salt precipitates, yielding rough, dull coatings.")
        recs.append("Add dilute Sulfuric Acid to lower pH.")

    if temp < std["temp"]["min"]:
        issues.append(f"Low Temperature: {temp}°C (Min: {std['temp']['min']}°C)")
        root_causes.append("Decreased ion diffusion, leading to high-current area burning.")
        recs.append("Heat the bath to 58°C.")

    if cd > std["current_density"]["max"]:
        issues.append(f"High Current Density: {cd} A/dm² (Max: {std['current_density']['max']} A/dm²)")
        root_causes.append("Exceeds brightener range threshold, burning edges of rims/handles.")
        recs.append("Reduce rectifier amperage output.")

    # 4. Symptoms
    if problem_symptom == "dull" or problem_symptom == "streaks":
        status = "Warning" if status == "Optimal" else status
        issues.append("Streaks or dull haze detected on final nickel surface.")
        root_causes.append("Brightener depletion or organic impurities contamination.")
        recs.append("Perform Hull Cell test. Add carrier/brightener. Schedule carbon filtration if metallic impurities (e.g. Copper) drag-in is high.")

    if status != "Optimal":
        confidence = 0.90
        
    return BathAnalysisResult(
        bath="Bright Nickel",
        status=status,
        issues=issues,
        root_causes=root_causes,
        recommendations=recs if recs else ["Bright nickel parameters optimal. Leveling and reflectivity compliant."],
        confidence=confidence
    )


def diagnose_chrome_plating(
    part_type: str, 
    params: Dict[str, float], 
    problem_symptom: Optional[str]
) -> BathAnalysisResult:
    issues = []
    root_causes = []
    recs = []
    status = "Optimal"
    confidence = 0.95
    
    std = BATH_STANDARDS["chrome_plating"]["chemistry"]
    chromic = params.get("chromic_acid", std["chromic_acid"]["optimal"])
    ratio = params.get("sulfate_ratio", std["sulfate_ratio"]["optimal"])
    temp = params.get("temp", std["temp"]["optimal"])
    cd = params.get("current_density", std["current_density"]["optimal"])
    
    # 1. Chromic Acid Check
    if chromic < std["chromic_acid"]["min"]:
        status = "Warning"
        issues.append(f"Low Chromic Acid: {chromic} g/L (Min: {std['chromic_acid']['min']} g/L)")
        root_causes.append("Weak throwing power and poor thickness in recessed areas (especially inside silencer cavities).")
        recs.append("Add Chromic Acid flakes (CrO3) to restore bath level to 250 g/L.")
    elif chromic > std["chromic_acid"]["max"]:
        issues.append(f"High Chromic Acid: {chromic} g/L (Max: {std['chromic_acid']['max']} g/L)")
        root_causes.append("Excessive drag-out waste, high viscosity, and accelerated air scrubber exhaust clogging.")
        recs.append("Dilute bath slightly or monitor exhaust mist suppressants.")

    # 2. Sulfate Catalyst Ratio Check
    if ratio < std["sulfate_ratio"]["min"]:
        status = "Critical"
        issues.append(f"Low Chromic-to-Sulfate Ratio (Excess Sulfate): {ratio}:1 (Min: {std['sulfate_ratio']['min']}:1)")
        root_causes.append("Excess sulfate catalyst causes narrow plating range, low cathode efficiency, and chromium burning at high-current areas.")
        recs.append("Add Barium Carbonate (BaCO3) at 1–2 g/L to precipitate excess sulfate as insoluble Barium Sulfate.")
    elif ratio > std["sulfate_ratio"]["max"]:
        status = "Critical"
        issues.append(f"High Chromic-to-Sulfate Ratio (Low Sulfate): {ratio}:1 (Max: {std['sulfate_ratio']['max']}:1)")
        root_causes.append("Sulfate deficiency results in very poor coverage, loss of throwing power, and milky chrome deposits in low-current density zones.")
        recs.append("Add concentrated Sulfuric Acid (H2SO4) carefully to restore the 100:1 ratio.")

    # 3. Temperature / CD Checks
    if temp < std["temp"]["min"]:
        status = "Warning" if status != "Critical" else status
        issues.append(f"Low Temperature: {temp}°C (Min: {std['temp']['min']}°C)")
        root_causes.append("Causes milky, grey chromium deposits and lowers current threshold before burning.")
        recs.append("Increase temperature using immersion steam coils to maintain 42°C.")
    elif temp > std["temp"]["max"]:
        status = "Warning" if status != "Critical" else status
        issues.append(f"High Temperature: {temp}°C (Max: {std['temp']['max']}°C)")
        root_causes.append("Drastically decreases cathode current efficiency; requires high current to initiate chrome deposition.")
        recs.append("Cool the bath to 42°C.")

    if cd < std["current_density"]["min"]:
        status = "Warning" if status != "Critical" else status
        issues.append(f"Low Current Density: {cd} A/dm² (Min: {std['current_density']['min']} A/dm²)")
        root_causes.append("Below the threshold required to initiate deposition, resulting in unplated bare nickel patches (passive chrome skip).")
        recs.append("Check rectifier settings. Silencers and large fenders require high amperage startup surges.")
    elif cd > std["current_density"]["max"]:
        status = "Warning" if status != "Critical" else status
        issues.append(f"High Current Density: {cd} A/dm² (Max: {std['current_density']['max']} A/dm²)")
        root_causes.append("Exceeds deposition limits, burning edges of rims and handlebars.")
        recs.append("Reduce rectifier amperage.")

    # 4. Symptoms
    if problem_symptom == "milky":
        status = "Warning" if status == "Optimal" else status
        issues.append("Milky / cloudy deposits reported.")
        root_causes.append("Sulfate catalyst deficiency or low bath temperature.")
        recs.append("Restore 100:1 ratio by adding sulfuric acid. Check bath heaters.")
    elif problem_symptom == "burning":
        status = "Warning" if status == "Optimal" else status
        issues.append("Burnt edges detected on plated rims/silencers.")
        root_causes.append("Excessive current density or cold bath temperature.")
        recs.append("Reduce rectifier output. Audit conforming robber racking configurations.")

    if status != "Optimal":
        confidence = 0.90
        
    return BathAnalysisResult(
        bath="Chrome Plating",
        status=status,
        issues=issues,
        root_causes=root_causes,
        recommendations=recs if recs else ["Chrome bath parameters healthy. Check water rinses preceding chrome to prevent sulfate carryover."],
        confidence=confidence
    )


def analyze_single_bath(
    bath_type: str, 
    part_type: str, 
    parameters: Dict[str, float], 
    problem_symptom: Optional[str] = None
) -> BathAnalysisResult:
    """
    Orchestrates diagnosis for a single bath.
    """
    key = bath_type.lower().strip()
    if key == "caustic_cleaning":
        return diagnose_caustic_cleaning(part_type, parameters, problem_symptom)
    elif key == "acid_activation":
        return diagnose_acid_activation(part_type, parameters, problem_symptom)
    elif key == "semi_bright_nickel":
        return diagnose_semi_bright_nickel(part_type, parameters, problem_symptom)
    elif key == "bright_nickel":
        return diagnose_bright_nickel(part_type, parameters, problem_symptom)
    elif key == "chrome_plating":
        return diagnose_chrome_plating(part_type, parameters, problem_symptom)
    else:
        # Fallback
        return BathAnalysisResult(
            bath=bath_type.replace("_", " ").title(),
            status="Optimal",
            issues=[],
            root_causes=[],
            recommendations=["Parameter checks completed. No anomalies defined for this stage."],
            confidence=0.95
        )


def analyze_complete_line(request: Any) -> LineAnalysisResponse:
    """
    Evaluates every bath in the production line, predicts line-wide defects, and summarizes corrective actions.
    """
    baths_results = []
    overall_defects = []
    overall_recs = []
    line_status = "Optimal"
    confidence_sum = 0.0
    count = 0
    
    # Map input bath data to analyzers
    bath_mappings = [
        ("caustic_cleaning", request.caustic_cleaning, "Caustic Cleaning"),
        ("acid_activation", request.acid_activation, "Sulfuric Acid Activation"),
        ("semi_bright_nickel", request.semi_bright_nickel, "Semi-Bright Nickel"),
        ("bright_nickel", request.bright_nickel, "Bright Nickel"),
        ("chrome_plating", request.chrome_plating, "Chrome Plating")
    ]
    
    for key, data, readable_name in bath_mappings:
        if data is not None:
            # Run analysis
            res = analyze_single_bath(key, request.part_type, data, request.problem_symptom)
            baths_results.append(res)
            confidence_sum += res.confidence
            count += 1
            
            # Aggregate status
            if res.status == "Critical":
                line_status = "Critical"
            elif res.status == "Warning" and line_status != "Critical":
                line_status = "Warning"
                
            # Collect defects & recommendations
            for issue in res.issues:
                overall_defects.append(f"{readable_name}: {issue}")
            for rec in res.recommendations:
                if rec not in overall_recs and not rec.endswith("optimal.") and not rec.endswith("stable."):
                    overall_recs.append(rec)
        else:
            # If no data, return a default optimal record to keep layout clean
            baths_results.append(BathAnalysisResult(
                bath=readable_name,
                status="Optimal",
                issues=[],
                root_causes=[],
                recommendations=[f"Bath parameters offline. Maintain standard monitoring."],
                confidence=0.95
            ))
            confidence_sum += 0.95
            count += 1

    # Overall predicted defects based on combinations
    if line_status == "Critical":
        overall_defects.append("High risk of line-wide adhesion failure (peeling) or severe metallic burning.")
    elif line_status == "Warning":
        overall_defects.append("Risk of specular reflectivity haze, micro-roughness, or low thickness coverage.")
    else:
        overall_defects.append("No active defects predicted. Coating micro-structure complies with factory yield thresholds.")

    return LineAnalysisResponse(
        success=True,
        line_status=line_status,
        baths=baths_results,
        overall_predicted_defects=overall_defects,
        overall_recommendations=overall_recs if overall_recs else ["No corrective action required. Production line is running optimally."],
        confidence=round(confidence_sum / max(1, count), 2)
    )
