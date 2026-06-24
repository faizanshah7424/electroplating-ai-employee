import re
from typing import List, Dict, Any, Optional

class ConversationMemory:
    def __init__(self):
        self.history: List[Dict[str, str]] = []
        self.variables: Dict[str, Any] = {
            "name": None,
            "mood": None,
            "bath_context": None
        }

    def add_message(self, role: str, content: str):
        self.history.append({"role": role, "content": content})
        # Keep history length bounded to prevent memory leak
        if len(self.history) > 100:
            self.history = self.history[-100:]
        self._analyze_latest_input(role, content)

    def get_history(self) -> List[Dict[str, str]]:
        return self.history

    def set_history(self, history: List[Dict[str, str]]):
        self.history = list(history)
        # Recalculate context variables from the history
        for msg in self.history:
            self._analyze_latest_input(msg["role"], msg["content"])

    def set_variable(self, key: str, value: Any):
        self.variables[key] = value

    def get_variable(self, key: str, default: Any = None) -> Any:
        return self.variables.get(key, default)

    def clear(self):
        self.history = []
        self.variables = {
            "name": None,
            "mood": None,
            "bath_context": None
        }

    def _analyze_latest_input(self, role: str, content: str):
        if role != "user":
            return
        
        lower_content = content.lower()
        
        # 1. Name extraction (e.g. "mera naam Faizan hai", "I am Faizan", "my name is Faizan")
        name_query_indicators = [
            "naam kya", "name kya", "naam kia", "name kia", 
            "what is my name", "what's my name", "who am i",
            "tell me my name", "know my name", "my name?"
        ]
        
        if any(indicator in lower_content for indicator in name_query_indicators):
            pass
        else:
            name_patterns = [
                r"mera\s+(?:naam|name)\s+([a-zA-Z\s]+?)(?:\s+hai|\s+is|\.|$)",
                r"my\s+name\s+is\s+([a-zA-Z\s]+?)(?:\.|$)",
                r"i\s+am\s+([a-zA-Z\s]+?)(?:\.|$)"
            ]
            for pattern in name_patterns:
                match = re.search(pattern, lower_content)
                if match:
                    raw_name = match.group(1).strip()
                    self.variables["name"] = " ".join([w.capitalize() for w in raw_name.split()])
                    break
                
        # 2. Mood extraction (e.g. "mood off hai", "i am sad", "happy")
        mood_off_indicators = ["mood off", "sad", "upset", "mood kharab", "tensed", "tired", "mood khraab"]
        mood_happy_indicators = ["happy", "fine", "mood acha", "khush", "good", "amazing"]
        
        if any(ind in lower_content for ind in mood_off_indicators):
            self.variables["mood"] = "off"
        elif any(ind in lower_content for ind in mood_happy_indicators):
            self.variables["mood"] = "happy"

        # 3. Bath context detection
        bath_keywords = {
            "caustic": "caustic cleaning",
            "naoh": "caustic cleaning",
            "acid": "acid activation",
            "h2so4": "acid activation",
            "pickle": "acid activation",
            "semi-bright": "semi-bright nickel",
            "semibright": "semi-bright nickel",
            "bright nickel": "bright nickel",
            "chrome": "chrome plating",
            "chromium": "chrome plating"
        }
        for kw, bath in bath_keywords.items():
            if kw in lower_content:
                self.variables["bath_context"] = bath
                break

class MemoryManager:
    def __init__(self):
        self.sessions: Dict[str, ConversationMemory] = {}

    def get_session(self, session_id: str = "default") -> ConversationMemory:
        if session_id not in self.sessions:
            self.sessions[session_id] = ConversationMemory()
        return self.sessions[session_id]

    def clear_session(self, session_id: str = "default"):
        if session_id in self.sessions:
            self.sessions[session_id].clear()

memory_manager = MemoryManager()
