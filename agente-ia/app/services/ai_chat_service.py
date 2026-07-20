import os
import google.generativeai as genai
from dotenv import load_dotenv

from app.schemas.ai_chat_schema import AiChatRequest

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


def build_chat_prompt(data: AiChatRequest) -> str:
    return f"""
{data.prompt}

REGRAS OBRIGATÓRIAS:
- Responda somente com base no contexto técnico fornecido.
- Se a resposta não estiver no contexto, diga que não encontrou essa informação na base técnica disponível.
- Não invente dados técnicos, medidas, procedimentos, códigos, portas, tensões ou configurações.
- Responda em português brasileiro.
- Seja claro, objetivo e útil para um cliente da Sirros.
- Não mencione que recebeu "chunks" ou "contexto". Use a informação naturalmente.
- Se houver orientação de segurança ou suporte, destaque com cuidado.

CONTEXTO TÉCNICO DISPONÍVEL:
{data.context}

PERGUNTA DO CLIENTE:
{data.question}

RESPOSTA:
"""


async def generate_ai_chat_answer(data: AiChatRequest) -> str:
    if not GEMINI_API_KEY:
        return "A chave GEMINI_API_KEY não está configurada no serviço de IA."

    if not data.context.strip():
        return "Não encontrei essa informação na base técnica disponível para este dispositivo."

    model = genai.GenerativeModel(
        model_name=GEMINI_MODEL,
        generation_config={
            "temperature": 0.2,
            "max_output_tokens": 800,
        },
    )

    final_prompt = build_chat_prompt(data)

    response = model.generate_content(final_prompt)

    answer = getattr(response, "text", None)

    if not answer:
        return "Não foi possível gerar uma resposta com base na documentação disponível."

    return answer.strip()