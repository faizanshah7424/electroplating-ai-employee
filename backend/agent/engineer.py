import os
import logging
from typing import List, Dict, Any, Optional
from backend.config import settings
from backend.services.calculator import calculate_plating_parameters, METAL_PROFILES
from backend.services.diagnosis import diagnose_plating_bath

logger = logging.getLogger("electroplating.agent")

HAS_GEMINI_SDK = False
try:
    import google.generativeai as genai
    HAS_GEMINI_SDK = True
except ImportError:
    logger.warning("google-generativeai SDK not found. Conversational agent will run in Simulation Mode.")

SYSTEM_INSTRUCTION = """
You are a Senior Electroplating Engineer with 30 years of industrial experience in metal finishing.
You specialize in motorcycle components: rims, silencers, handles, and fenders.
You are extremely professional, detailed, and focus on chemical safety, Faraday's Law, and troubleshooting.
Your advice is structured, actionable, and uses proper metallurgical terms.
You have deep expertise in the entire 8-stage production line:
1. Caustic Cleaning (NaOH)
2. Water Rinse
3. Sulfuric Acid Activation (H2SO4)
4. Water Rinse
5. Semi-Bright Nickel
6. Bright Nickel
7. Chrome Plating
8. Final Inspection
"""

def generate_simulation_response(message_content: str, context: Optional[Dict[str, Any]]) -> str:
    """
    An expert-system rule base providing highly technical, structured electroplating guidance.
    """
    msg = message_content.lower()
    
    # Extract details from context if available
    part = context.get("part", "rim") if context else "rim"
    metal = context.get("metal", "nickel") if context else "nickel"
    
    # 1. Caustic Cleaning
    if "caustic" in msg or "naoh" in msg or "clean" in msg or "degreas" in msg:
        return f"""### Industrial Troubleshooting: Caustic Cleaning Bath (NaOH)
**Stage 1 in Production Line** | **Reviewing Component:** {part.capitalize()}

Caustic cleaning is the foundation of plating adhesion. For motorcycle parts like {part}s, which carry heavy stamping oils, drawing lubricants, or polishing buff residues, a contaminated or weak caustic cleaner will lead to total peeling down the line.

#### 1. Standard Process Thresholds
*   **Sodium Hydroxide (NaOH) Concentration:** **50–90 g/L** (Optimal: **70 g/L**).
*   **Operating Temperature:** **60–80°C** (Optimal: **70°C**).
*   **Soak Immersion Duration:** **5–15 minutes** (Optimal: **10 minutes**).

#### 2. Diagnostic & Failure Modes
*   **Oil Contamination:** When the cleaner bath accumulates drag-in oils, they form a layer on top. During extraction, parts pick up an oil microfilm, causing a *water-break* condition.
*   **Low Temperature (<60°C):** High-tallow buffing compounds do not melt, causing residual patches that act as insulators during plating.
*   **Poor Alkaline Rinse:** Caustic carryover into the acid pickle will neutralize the acid, leading to activation failure.

#### 3. Corrective Action Playbook
1.  **Water-Break Inspection:** Perform a water-break test after rinsing. Water should form a continuous sheet on the {part}. If water beads up, cleaning is insufficient.
2.  **Add Skimmers:** Install a coalescing oil separator/skimmer in the caustic tank to continuously remove floating tramp oils.
3.  **Chemical Recharge:** If NaOH drops below 50 g/L, add concentrated caustic soda salts. If the bath is loaded with emulsified soil, schedule a dump, tank clean, and recharge.
"""

    # 2. Sulfuric Acid Activation
    elif "acid" in msg or "h2so4" in msg or "activation" in msg or "pickle" in msg:
        return f"""### Engineering Analysis: Sulfuric Acid Activation (H2SO4)
**Stage 3 in Production Line** | **Reviewing Component:** {part.capitalize()}

Acid activation (pickling) strips micro-oxides, welding scale, and surface passivations from steel parts like {part}s, exposing the raw iron crystal lattice to allow direct metallic bonding with the subsequent nickel layers.

#### 1. Process Specifications
*   **Sulfuric Acid (H2SO4) Concentration:** **5–12% v/v** (Optimal: **8% v/v**).
*   **Operating Temperature:** Ambient (**20–30°C**). Do not heat.
*   **Immersion Time:** **30–90 seconds** (Optimal: **60 seconds**).

#### 2. Critical Failure Modes
*   **Under-Pickling (Short time / Low Acid):** Native iron oxides ($Fe_2O_3$) are not completely dissolved. The nickel layer plates over oxide, resulting in blistering or catastrophic peeling.
*   **Over-Pickling (Excess time >90s / High Acid):** The acid attacks the substrate grain boundaries, dissolving iron but leaving insoluble carbon smut (black powder) behind. Nickel plates onto the smut, causing instant adhesion failure.
*   **Copper Drag-in:** If copper ions contaminate the acid pickle, they will immersion-plate onto the steel as a loose, red film, destroying nickel adhesion.

#### 3. Engineering Recommendations
1.  **Smut Audit:** Wipe an activated {part} with a white paper towel. If a black smudge appears, the part is over-pickled. Reduce activation time or acid concentration.
2.  **Acid Concentration Check:** Maintain sulfuric acid at 8% v/v. Conduct daily titrations.
3.  **Drag-in Safeguards:** Replace sulfuric acid if iron contamination exceeds 10 g/L or if a reddish copper immersion film is observed. Ensure thorough rinsing after pickling.
"""

    # 3. Semi-Bright Nickel Bath
    elif "semi-bright" in msg or "semibright" in msg or "duplex" in msg:
        return f"""### Metallurgical Report: Semi-Bright Nickel Plating
**Stage 5 in Production Line (Base Duplex Undercoat)** | **Reviewing Component:** {part.capitalize()}

Semi-bright nickel is sulfur-free and highly ductile. For motorcycle {part}s, it serves as the base layer of the "Duplex Nickel" system. It provides high leveling (filling in substrate scratches) and acts as the cathodic barrier against corrosion.

#### 1. Core Operating Chemistry
*   **Nickel Sulfate ($NiSO_4 \\cdot 6H_2O$):** **250–325 g/L** (Metal source).
*   **Nickel Chloride ($NiCl_2 \\cdot 6H_2O$):** **40–60 g/L** (Anode activation).
*   **Boric Acid ($H_3BO_3$):** **35–45 g/L** (pH buffer).
*   **pH Range:** **3.8–4.5** | **Temperature:** **50–60°C** | **Current Density:** **2.0–4.0 A/dm²**.

#### 2. Diagnostic & Failure Analysis
*   **Leveling Impairment:** Caused by low temperature or organic breakdown products. Leveling is key to filling in polishing marks on handlebars and rims.
*   **Cathode film burning:** Low Boric acid buffer allows local pH at the cathode film to exceed 6.0, causing nickel hydroxide to precipitate into the deposit as a grey, rough burn.
*   **Hydrogen pitting:** Lack of mechanical agitation or low surfactant levels allows hydrogen bubbles to stick to the {part}, creating micro-voids (pits).

#### 3. Corrective Action Protocols
1.  **Dose Boric Acid:** Maintain boric acid strictly at 40 g/L to buffer the boundary layer.
2.  **Add leveling agents:** Replenish proprietary sulfur-free leveling carriers.
3.  **Carbon Purification:** If leveling is low and deposit is hazy, perform a batch carbon filtration treatment to purge organic degradation products.
"""

    # 4. Bright Nickel Bath
    elif "bright nickel" in msg or "brightener" in msg:
        return f"""### Process Optimization: Bright Nickel Plating Bath
**Stage 6 in Production Line (Duplex Topcoat)** | **Reviewing Component:** {part.capitalize()}

Bright nickel plates on top of semi-bright nickel. It co-deposits organic sulfur (from brightener additives), creating a mirror-like sheen. In a duplex system, the bright nickel layer is electrochemically active relative to the sulfur-free semi-bright underlayer. This forces corrosion to spread *laterally* rather than penetrating down to the steel substrate.

#### 1. Bath Standard Limits
*   **Organic Brightener Additives:** **1.0–2.5 mL/L**.
*   **Nickel Sulfate:** **240–300 g/L** | **Nickel Chloride:** **40–80 g/L**.
*   **Boric Acid:** **35–45 g/L** | **pH:** **4.0–4.8** | **Temperature:** **50–65°C**.

#### 2. Process Anomalies
*   **Low Brightness / Haze:** Depletion of organic brighteners or contamination by copper and active metallic impurities (often dragged in from rack hooks).
*   **Streaking / Pitting:** Low carrier concentration or high organic contamination.
*   **Brittleness & Peeling:** Excessive brightener concentration (>2.5 mL/L) causing highly stressed deposits that flake off under load.

#### 3. Engineering Mitigations
1.  **Hull Cell Audit:** Always run a 2-Amp, 5-minute Hull Cell panel to determine the exact dosage of brighteners before adding chemicals directly to the main tank.
2.  **Low Current Electrolysis (Dummying):** To remove metallic impurities (e.g. Copper), plate a corrugated steel sheet at **0.2–0.5 A/dm²** with high agitation overnight.
3.  **Verify pH:** Maintain pH at 4.4. Lower with dilute Sulfuric Acid; raise with Nickel Carbonate.
"""

    # 5. Chrome Plating Bath
    elif "chrome" in msg or "chromium" in msg or "ratio" in msg or "sulfate ratio" in msg or "milky" in msg:
        return f"""### Process Control: Decorative Chrome Plating Bath
**Stage 7 in Production Line (Final Luster Layer)** | **Reviewing Component:** {part.capitalize()}

Chrome plating applies a thin, extremely hard, corrosion-resistant oxide skin over the nickel duplex stack. Chrome plating has notoriously poor current efficiency (12–18%) and low throwing power, requiring precise parameter controls to plate complex shapes like {part}s.

#### 1. Control Parameters
*   **Chromic Acid ($CrO_3$):** **220–280 g/L** (Optimal: **250 g/L**).
*   **Catalyst Ratio ($CrO_3 : H_2SO_4$):** **90:1 to 110:1** (Optimal: **100:1**).
*   **Operating Temp:** **40–45°C** (Optimal: **42°C**).
*   **Current Density:** **10.0–25.0 A/dm²** (Optimal: **18.0 A/dm²**).

#### 2. The 100:1 Ratio Rule & Diagnostics
*   **Low Ratio (<90:1, Excess Sulfate):** Causes narrowed plating range and chrome burning at high-current areas (like rim flanges).
    *   *Correction:* Add **Barium Carbonate ($BaCO_3$)** to precipitate excess sulfate as insoluble barium sulfate ($BaSO_4$).
*   **High Ratio (>110:1, Low Sulfate):** Causes poor throwing power and "milky", dull grey deposits in low-current recesses.
    *   *Correction:* Add concentrated **Sulfuric Acid ($H_2SO_4$)** to restore the catalyst balance.
*   **Milky Chrome deposits:** Result from high catalyst ratio or low bath temperature (<40°C).
*   **Chrome Skip (Bare Nickel patches):** Caused by passive nickel underlayers or inadequate rectifier contact.

#### 3. Corrective Racking Checklist
1.  **Auxiliary Anodes:** Silencer baffle chambers act as Faraday cages. Position conforming lead-alloy auxiliary anodes inside deep recesses to throw chrome.
2.  **Contact Cleanliness:** Clean rectifier cathode hooks. Ensure parts do not swing or lose contact, which causes passive nickel chrome skip.
"""

    # 6. Duplex Corrosion Protection Chemistry Explanation
    elif "duplex" in msg or "corros" in msg:
        return f"""### Engineering Brief: The Duplex Nickel Corrosion Mechanism
For motorcycle parts exposed to rain, salt, and debris, standard single-layer nickel-chrome plating is insufficient. We employ a **Duplex Nickel** system:

1.  **Semi-Bright Nickel (Sulfur-Free):** Plates directly onto the activated steel. It contains **< 0.005% sulfur**.
2.  **Bright Nickel (Sulfur-Containing):** Plates on top of the semi-bright layer. It contains **0.04% to 0.15% sulfur**.

#### Why this works electrochemically:
*   The inclusion of sulfur in the bright nickel deposit makes it **more electronegative (active)** than the sulfur-free semi-bright nickel.
*   When a corrosive agent (like salt water) penetrates the outer chrome shell, it forms a galvanic cell between the two nickel layers.
*   Because the bright nickel is active (anodic) relative to the semi-bright nickel (cathodic), the corrosion proceeds **laterally** through the bright nickel layer, rather than penetrating vertically down through the semi-bright nickel to the steel substrate.
*   This protects the steel base from rusting far longer than single-layer coatings.
"""

    # 7. Default response
    else:
        return f"""### Senior Electroplating Engineer Console
Welcome to the AI Employee terminal. I am monitoring the complete 8-stage production line for motorcycle **{part}s**.

You can ask me technical questions or troubleshooting advice regarding:
1.  **Caustic Cleaning (NaOH):** Concentrates, temperatures, soap chemistry, and oil removal.
2.  **Sulfuric Acid Activation (H2SO4):** Oxide pickling, activation times, acid smut, and peeling.
3.  **Semi-Bright Nickel:** Watts chemistry, sulfur-free ductility, and leveling.
4.  **Bright Nickel:** Organic brightener levels, Hull Cell tests, and dummying purification.
5.  **Chrome Plating:** Chromic acid, the critical **100:1 sulfate ratio**, milky deposits, and lead anodes.
6.  **Duplex Nickel corrosion barrier:** Galvanic cell mechanisms.

*To check bath status, enter chemical logs in the Dashboard or ask me direct troubleshooting questions.*
"""


def chat_with_engineer(messages: List[Dict[str, str]], context: Optional[Dict[str, Any]] = None) -> str:
    """
    Orchestrates conversation with the Senior Engineer. Falls back to simulated expert if Gemini is offline.
    """
    last_user_message = ""
    for msg in reversed(messages):
        if msg.get("role") == "user":
            last_user_message = msg.get("content", "")
            break
            
    if not last_user_message:
        return "Please input a query for the Electroplating Engineer."
        
    mode = settings.AI_ENGINE_MODE.lower()
    api_key = settings.GEMINI_API_KEY
    
    if mode == "gemini" and api_key and HAS_GEMINI_SDK:
        try:
            logger.info("Initializing Gemini Chat for production line...")
            genai.configure(api_key=api_key)
            
            model = genai.GenerativeModel(
                model_name="gemini-2.5-flash",
                system_instruction=SYSTEM_INSTRUCTION
            )
            
            chat = model.start_chat(history=[])
            
            context_prompt = ""
            if context:
                context_prompt = f"[System Context: User is plating '{context.get('part', 'rim')}' through the 8-stage line. Active selected bath: {context.get('metal', 'nickel')}]\n\n"
            
            full_prompt = context_prompt + last_user_message
            logger.info("Sending message to Gemini API...")
            response = chat.send_message(full_prompt)
            return response.text
            
        except Exception as e:
            logger.error(f"Gemini API failure: {str(e)}. Falling back to expert simulation.")
            return generate_simulation_response(last_user_message, context)
            
    else:
        logger.info("Using simulation mode for conversational response.")
        return generate_simulation_response(last_user_message, context)
