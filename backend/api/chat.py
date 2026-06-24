from fastapi import APIRouter, HTTPException
from backend.schemas.chat import ChatRequest, ChatResponse
from backend.agent import run_chat_query
from backend.utils.logging import get_logger

router = APIRouter()
logger = get_logger("electroplating.api.chat")

@router.post("/chat", response_model=ChatResponse)
def converse_with_engineer(request: ChatRequest):
    try:
        logger.info("Conversational chat request received.")
        
        # Check input types
        if request.message is not None:
            # Simplified payload format
            user_msg = request.message
            formatted_messages = None
        elif request.messages:
            # Standard history format
            formatted_messages = [
                {"role": msg.role, "content": msg.content}
                for msg in request.messages
            ]
            user_msg = formatted_messages[-1]["content"] if formatted_messages else ""
        else:
            raise HTTPException(
                status_code=400, 
                detail="Either 'message' or 'messages' history must be provided."
            )
            
        # Run query through the updated conversational AI service
        response_text = run_chat_query(
            user_message=user_msg,
            history=formatted_messages,
            context=request.context
        )
        
        return ChatResponse(
            success=True,
            response=response_text
        )
        
    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        logger.error(f"Internal error during chat transaction: {str(e)}")
        return ChatResponse(
            success=False,
            response="I apologize, but my engineering systems are currently encountering communication lag. Let's double check bath levels while I reconnect.",
            error=str(e)
        )

