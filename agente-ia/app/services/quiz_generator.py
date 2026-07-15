import json
import os

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY não encontrada no arquivo .env")

client = genai.Client(api_key=GEMINI_API_KEY)


def generate_quiz_from_content(
    title: str,
    content: str,
    quiz_type: str,
    total_questions: int = 5,
):
    limited_content = content[:30000]

    prompt = f"""
Você é um especialista em criação de avaliações para uma plataforma LMS técnica chamada Sirros Academy.

Sua tarefa é gerar perguntas objetivas com alternativas para avaliar o aprendizado do aluno.

Título da avaliação:
{title}

Tipo da avaliação:
{quiz_type}

Quantidade de questões:
{total_questions}

Conteúdo base:
\"\"\"
{limited_content}
\"\"\"

Regras obrigatórias:
- Responda APENAS em JSON válido.
- Não use markdown.
- Não use ```json.
- Não invente informações que não estejam no conteúdo base.
- Cada questão deve ter exatamente 4 alternativas.
- Cada questão deve ter exatamente 1 alternativa correta.
- As perguntas devem ser claras, técnicas e objetivas.
- As alternativas incorretas devem ser plausíveis, mas claramente erradas.
- Use linguagem simples para técnicos/alunos.
- O campo "correta" deve ser true apenas para a alternativa correta.
- O campo "ordem" deve começar em 1.

Formato obrigatório:

{{
  "titulo": "Título da avaliação",
  "questoes": [
    {{
      "pergunta": "Texto da pergunta",
      "explicacao": "Explicação breve da resposta correta",
      "ordem": 1,
      "opcoes": [
        {{
          "texto_opcao": "Alternativa A",
          "correta": true
        }},
        {{
          "texto_opcao": "Alternativa B",
          "correta": false
        }},
        {{
          "texto_opcao": "Alternativa C",
          "correta": false
        }},
        {{
          "texto_opcao": "Alternativa D",
          "correta": false
        }}
      ]
    }}
  ]
}}
"""

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.4,
        ),
    )

    response_text = response.text

    if not response_text:
        raise ValueError("A IA não retornou conteúdo")

    try:
        data = json.loads(response_text)
    except json.JSONDecodeError:
        cleaned = (
            response_text
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

        data = json.loads(cleaned)

    return data