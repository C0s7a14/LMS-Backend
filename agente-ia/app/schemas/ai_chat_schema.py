from pydantic import BaseModel


class AiChatRequest(BaseModel):
    prompt: str
    question: str
    context: str


class AiChatResponse(BaseModel):
    answer: str