from fastapi import APIRouter, HTTPException

from app.schemas.ai_chat_schema import AiChatRequest, AiChatResponse
from app.services.ai_chat_service import generate_ai_chat_answer

router = APIRouter(prefix="/ai", tags=["AI Chat"])


@router.post("/chat", response_model=AiChatResponse)
async def chat_with_ai(data: AiChatRequest):
    try:
        answer = await generate_ai_chat_answer(data)

        return AiChatResponse(answer=answer)

    except Exception as error:
        print("Erro ao gerar resposta do agente IA:", error)

        raise HTTPException(
            status_code=500,
            detail="Erro ao gerar resposta do agente IA."
        )