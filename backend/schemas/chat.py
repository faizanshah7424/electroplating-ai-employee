from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class Message(BaseModel):
    role: str = Field(..., description="Message sender role: user, assistant, system")
    content: str = Field(..., description="Text content of the message")

class ChatRequest(BaseModel):
    messages: Optional[List[Message]] = Field(default=None, description="Optional conversation history")
    message: Optional[str] = Field(default=None, description="Optional single message for simplified requests")
    context: Optional[Dict[str, Any]] = Field(
        default=None, 
        description="Optional telemetry details (metal, part, current, pH, temperature) to guide the agent"
    )

class ChatResponse(BaseModel):
    success: bool = Field(default=True, description="Indicates if chat was processed successfully")
    response: str = Field(..., description="AI Engineer markdown response")
    error: Optional[str] = None

