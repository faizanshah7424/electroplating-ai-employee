import logging
import re
from typing import List, Dict, Any, Optional
from backend.config import settings
from backend.agent.prompts import SYSTEM_PROMPT
from backend.agent.memory import memory_manager, ConversationMemory

logger = logging.getLogger("electroplating.agent.chat_service")

def classify_intent(message: str) -> str:
    """
    Classify the user message intent. Returns either 'GENERAL' or 'ELECTROPLATING'.
    """
    msg_lower = message.lower()
    
    # 1. Broad list of technical keywords that trigger Electroplating Mode
    tech_keywords = [
        "nickel", "chrome", "chromium", "semi nickel", "semi-bright", "semibright",
        "caustic cleaning", "caustic", "naoh", "degreas", "cleaning", "degrease", "degreasing",
        "sulfuric acid", "sulfuric", "h2so4", "activation", "pickle", "pickling",
        "current density", "current", "density", "ampere", "a/dm",
        "ph", "temperature", "temp", "celcius",
        "defect", "peeling", "peel", "pitting", "pit", "burning", "burn", 
        "blister", "roughness", "streaks", "dullness",
        "motorcycle", "bike", "rim", "silencer", "handle", "fender", "plating", "plate", "electroplating"
    ]
    
    # 2. Strict boundary/exact matching for short words to avoid false positives in general conversation
    for kw in tech_keywords:
        if kw in ["ph", "temp", "pit", "burn", "acid", "rim", "plate", "bath", "clean"]:
            if re.search(rf"\b{kw}\b", msg_lower):
                return "ELECTROPLATING"
        elif kw in msg_lower:
            return "ELECTROPLATING"
            
    return "GENERAL"

HAS_GEMINI_SDK = False
try:
    import google.generativeai as genai
    HAS_GEMINI_SDK = True
except ImportError:
    logger.warning("google-generativeai SDK not found. LLM chat will run in local simulation fallback mode.")

class SimulationEngine:
    def generate_response(self, prompt: str, memory: ConversationMemory, context: Optional[Dict[str, Any]] = None) -> str:
        prompt_lower = prompt.lower()
        
        # Access memory variables
        name = memory.get_variable("name")
        mood = memory.get_variable("mood")
        bath_context = memory.get_variable("bath_context")
        
        name_phrase = f" {name}" if name else ""

        intent = classify_intent(prompt)

        # ----------------------------------------------------
        # MODE B: ELECTROPLATING EXPERT (Activated on Technical Intent)
        # ----------------------------------------------------
        if intent == "ELECTROPLATING":
            # - pH issues (nickel)
            if "ph" in prompt_lower and ("nickel" in prompt_lower or "bath" in prompt_lower or "watt" in prompt_lower):
                if "5.5" in prompt_lower or "high" in prompt_lower:
                    return f"Nickel bath ka pH 5.5 hona bohot zyaada hai{name_phrase}. Isse boundary layer par nickel hydroxide precipitate ho jata hai, jis se deposition rough aur burnt ho sakti hai. Ideal pH range **3.8 to 4.5** (bright nickel ke liye **4.0 to 4.8**) honi chahiye. pH kam karne ke liye dilute **Sulfuric Acid ($H_2SO_4$)** ka chemical addition karein."
                elif "low" in prompt_lower or "3." in prompt_lower or "2." in prompt_lower:
                    return f"Nickel bath ka pH low hona (under 3.5) cathode current efficiency ko kam kar deta hai aur hydrogen gas generation barh jati hai, jis se deposit par **pitting** ka masla hota hai. pH ko **3.8 to 4.5** tak barhane ke liye **Nickel Carbonate ($NiCO_3$)** ka istemal karein."

            # - Caustic cleaning (naoh)
            if any(w in prompt_lower for w in ["caustic", "naoh", "clean", "degreas"]):
                return f"**Caustic Cleaning (NaOH) Stage 1 Remedy:**\nNaOH concentration **70 g/L** aur temperature **70°C** par hona chahiye. Agar motorcycle parts (jaise handles ya rims) par grease reh jaye, to subsequent coating peel ho sakti hai. Hamesha rinsing ke baad **Water-Break test** lagayen."

            # - Acid activation (h2so4)
            if any(w in prompt_lower for w in ["acid", "h2so4", "activation", "pickle"]):
                return f"**Sulfuric Acid Activation (H2SO4) Stage 3 Remedy:**\nAcid concentration **8% v/v** aur ambient temperature (25°C) par **60 seconds** ke liye activation hoti hai. Under-pickling se peeling hoti hai; over-pickling se steel grain dissolve ho jata hai aur surface par carbon smut deposit ho jata jo nickel adhesion ko fail karta hai."

            # - Semi-bright nickel
            if "semi-bright" in prompt_lower or "semibright" in prompt_lower:
                return f"**Semi-Bright Nickel (Watts Bath) Stage 5 Remedy:**\nNickel Sulfate (**280 g/L**), Nickel Chloride (**50 g/L**), Boric Acid (**40 g/L**), pH **4.2**, Temp **55°C**. Agar parts dull ho rahe hain to carbon purification se organic breakdown products ko clear karein."

            # - Bright nickel
            if "bright nickel" in prompt_lower or "brightener" in prompt_lower or "bright" in prompt_lower:
                return f"**Bright Nickel Plating Stage 6 Remedy:**\nBrightener concentration **1.5 mL/L** aur pH **4.4**, Temp **58°C**. Agar brightness kam ho jaye ya streaks aane lagein, to copper impurity ko remove karne ke liye low current density **dummying** (0.2-0.5 A/dm²) run karein."

            # - Chrome plating / 100:1 ratio
            if "chrome" in prompt_lower or "ratio" in prompt_lower or "chromic" in prompt_lower:
                return f"**Chrome Plating Stage 7 Catalyst Ratio Rule:**\nChromic Acid ($CrO_3$) to Sulfate ($SO_4^{{2-}}$) ratio hamesha **100:1** (e.g. 250 g/L Chromic acid ke liye 2.5 g/L Sulfuric acid) hona chahiye. Low ratio (excess sulfate) high current burning karta hai (Barium Carbonate add karein). High ratio (low sulfate) throwing power kam karta hai aur milky chrome banta hai (dilute sulfuric acid add karein)."

            # - Plating defects
            if "burning" in prompt_lower or "burn" in prompt_lower:
                return f"**Defect Diagnostic: Burning:**\nRims ke flanges ya silencers ke high current areas par burning tab hoti hai jab current density zyaada ho, pH high (>4.8) ho, ya Boric Acid buffer filter range se kam ho. Current density kam karein aur temperature check karein."

            if "pitting" in prompt_lower or "pit" in prompt_lower:
                return f"**Defect Diagnostic: Pitting:**\nDeposit par micro-holes (pits) tab bante hain jab hydrogen bubbles surface par chipak jatein hain. Iske liye cathode movement check karein, air agitation barhaen, pH test karein aur anti-pitting wetting agent (surfactant) add karein."

            if "peeling" in prompt_lower or "peel" in prompt_lower:
                return f"**Defect Diagnostic: Peeling:**\nAdhesion peeling pre-treatment defects ki wajah se hoti hai. Stage 1 Caustic cleaner check karein (grease carryover) ya Stage 3 Acid pickle (smut residue ya incomplete scale removal) check karein."

            # - Plating equations / Faraday's law / Calculation mode
            if any(w in prompt_lower for w in ["calculate", "faraday", "equation", "math", "formula", "current", "thickness"]):
                return "**Plating Calculation & Faraday's Law Math:**\nPlating thickness ($d$) aur plating time ($t$) calculate karne ke liye Faraday's Law use hota:\n\n$$m = \\frac{I \\times t \\times M}{z \\times F} \\times \\eta$$\n\nNickel ke liye valency $z=2$, molecular weight $M=58.69$ g/mol, aur efficiency $\\eta \\approx 95\\%$. Agar aap dynamic calculation slider ya Dashboard use karenge to automatic numbers calculate ho jayenge."

            # Default fallback for technical
            return f"Theek ho gaya{name_phrase}. Plating line ke bare mein details batayein, ya agar electrochemistry calculations ya defects troubleshooting karni ho to parameters batayein!"

        # ----------------------------------------------------
        # MODE A: GENERAL ASSISTANT (Natural Human Dialogue)
        # ----------------------------------------------------
        
        # 1. Identity Support (e.g. "apka naam kya hai", "who are you")
        if any(w in prompt_lower for w in ["apka naam", "apka name", "ap ka naam", "ap ka name", "aap ka naam", "aap ka name", "who are you", "tum kaun", "ap kaun", "your name"]):
            return "Main Electroplating AI Employee hoon. Aap meri madad se general baat bhi kar sakte hain aur electroplating ke technical sawalat bhi pooch sakte hain."

        # 2. Name Queries (e.g. "mera naam kya", "what is my name")
        if any(w in prompt_lower for w in ["mera naam kya", "what is my name", "mera name kya", "mera naam kia", "mera name kia", "what is my name", "what's my name"]):
            if name:
                return f"Aap ne pehle bataya tha ke aap ka naam {name} hai."
            else:
                return "Aap ne abhi tak apna naam nahi bataya. Aapka naam kya hai?"

        # 3. Simple Math (e.g. "2+2", "2 + 2")
        if any(math_str in prompt_lower.replace(" ", "") for math_str in ["2+2", "2+2="]):
            return "2+2 = 4"

        # 4. Weather Queries
        if any(w in prompt_lower for w in ["mausam", "weather"]):
            return "Main ek AI assistant hoon, mere paas live weather tracking ka system nahi hai, lekin aap apne local area ka weather forecast check kar sakte hain!"

        # 5. Greetings (Roman Urdu/English/Urdu)
        if any(w in prompt_lower for w in ["assalam o alaikum", "assalam-o-alaikum", "salam", "aoa", "a.o.a"]):
            reply = f"Wa Alaikum Assalam{name_phrase}! Kaise hain aap? Main aap ki kis tarah madad kar sakta hoon?"
            if mood == "off":
                reply += " Waise, aapne bataya tha ke aaj aapka mood thora off hai. Sab kheriyat hai?"
            return reply

        if any(w in prompt_lower for w in ["kese ho", "kaise ho", "kya haal hai", "kya chal raha"]):
            reply = f"Alhamdulillah{name_phrase}, main bilkul theek hoon! Aap batayein, aap kaise hain? Aaj kya chal raha hai?"
            return reply

        if any(prompt_lower.startswith(w) for w in ["hello", "hi", "hey", "hy"]):
            reply = f"Hello{name_phrase}! How are you doing today? How can I help you?"
            if mood == "off":
                reply += " (Hope your day gets better! Let me know if you want to talk or have any queries.)"
            return reply

        # 6. Name introduction acknowledgements
        if "mera naam" in prompt_lower or "my name is" in prompt_lower or "i am" in prompt_lower:
            if name:
                return f"Bohat khoob, {name}! Mujhe khushi hui aapse mil kar. Aur batayein, aaj kya chal raha hai?"

        # 7. Mood acknowledgements
        if any(ind in prompt_lower for ind in ["mood off", "upset", "sad", "tensed", "tired", "exhausted", "tension"]):
            return f"Acha? Kya hua dost{name_phrase}? Aaj kaam ka load zyada hai ya shift sakht rahi? Pareshan mat hon, chill karein!"

        if any(ind in prompt_lower for ind in ["happy", "mood acha", "khush", "good mood", "fine"]):
            return f"Zabardast{name_phrase}! Khushi hui sun kar. Jab mood acha ho to sara din acha guzarta hai! Aur bataiye, aaj kis cheez par guftagu karni hai?"

        # Default conversational responses (Completely general, no electroplating references!)
        responses = [
            f"Theek ho gaya{name_phrase}. Aur batayein, sab kheriyat hai?",
            f"Samajh gaya dost{name_phrase}. Koi aur baat karni ho ya sawal ho to batayein.",
            f"Ji bilkul. Aur sunayein, kya chal raha hai?",
            f"Sahi baat hai{name_phrase}. Main yahan aapki madad ke liye tayyar hoon. Batayein!"
        ]
        idx = len(prompt) % len(responses)
        return responses[idx]

simulation_engine = SimulationEngine()

def run_chat_query(
    user_message: str,
    history: Optional[List[Dict[str, str]]] = None,
    context: Optional[Dict[str, Any]] = None,
    session_id: str = "default"
) -> str:
    """
    Main entry point for AI Chat. Interacts with Memory, parses context,
    runs the LLM (Gemini) if configured, otherwise executes the smart SimulationEngine.
    """
    # 1. Fetch or initialize backend memory session
    memory = memory_manager.get_session(session_id)
    
    # 2. Update memory if a custom history list was passed in (e.g. from stateless frontend client)
    if history:
        memory.set_history(history)
    else:
        memory.add_message("user", user_message)

    # 3. Retrieve formatted history for the LLM
    formatted_history = memory.get_history()
    
    # 4. Check LLM engine mode
    mode = settings.AI_ENGINE_MODE.lower()
    api_key = settings.GEMINI_API_KEY
    
    if mode == "gemini" and api_key and HAS_GEMINI_SDK:
        try:
            logger.info("Initializing Gemini Chat with instruction set...")
            genai.configure(api_key=api_key)
            
            model = genai.GenerativeModel(
                model_name="gemini-2.5-flash",
                system_instruction=SYSTEM_PROMPT
            )
            
            # Format history for Gemini's structure (roles: user, model)
            gemini_history = []
            for msg in formatted_history[:-1]:
                role = "user" if msg["role"] == "user" else "model"
                gemini_history.append({
                    "role": role,
                    "parts": [msg["content"]]
                })
                
            chat = model.start_chat(history=gemini_history)
            
            intent = classify_intent(user_message)
            
            # Retrieve memory variables to inject into prompt directive
            name = memory.get_variable("name")
            mood = memory.get_variable("mood")
            bath_context = memory.get_variable("bath_context")
            
            name_info = f"User's name: {name}." if name else "User's name: Not known yet."
            mood_info = f"User's mood: {mood}." if mood else "User's mood: Not specified."
            bath_info = f"Last active bath context: {bath_context}." if bath_context else "No active bath context."
            
            memory_directive = f"[Memory Info: {name_info} | {mood_info} | {bath_info}]"

            if intent == "GENERAL":
                directive = (
                    f"{memory_directive}\n"
                    "[SYSTEM DIRECTIVE: The user's query is casual/general conversation. "
                    "You MUST respond in GENERAL MODE (Mode A). Do NOT reference electroplating, "
                    "baths, or chemical parameters. If the user asks for your name or identity, "
                    "you MUST answer exactly: 'Main Electroplating AI Employee hoon. Aap meri "
                    "madad se general baat bhi kar sakte hain aur electroplating ke technical sawalat bhi pooch sakte hain.']\n\n"
                )
            else:
                context_info = ""
                if context:
                    context_info = f"User is plating '{context.get('part', 'rim')}' through the 8-stage line. Active selected bath: {context.get('metal', 'nickel')}. "
                directive = (
                    f"{memory_directive}\n"
                    f"[System Context: {context_info}]\n"
                    "[SYSTEM DIRECTIVE: The user's query is technical. Respond in ELECTROPLATING MODE (Mode B). "
                    "Provide expert plating guidance, calculations, or quality control steps as requested.]\n\n"
                )
            
            full_prompt = directive + user_message
            logger.info("Sending message to Gemini Generative API...")
            response = chat.send_message(full_prompt)
            
            # Add assistant response back to memory
            memory.add_message("assistant", response.text)
            return response.text
            
        except Exception as e:
            logger.error(f"Gemini API invocation failure: {str(e)}. Falling back to local Simulation Engine.")
            response_text = simulation_engine.generate_response(user_message, memory, context)
            memory.add_message("assistant", response_text)
            return response_text
            
    else:
        # Simulation Mode
        logger.info("Executing conversational Simulation Engine fallback.")
        response_text = simulation_engine.generate_response(user_message, memory, context)
        memory.add_message("assistant", response_text)
        return response_text
