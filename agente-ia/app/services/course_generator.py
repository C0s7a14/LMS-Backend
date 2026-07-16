import json
import os

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

def parse_ai_json_response(response_text: str):
    if not response_text:
        raise ValueError("A IA não retornou conteúdo")

    cleaned = (
        response_text
        .replace("```json", "")
        .replace("```", "")
        .strip()
    )

    json_start = cleaned.find("{")

    if json_start == -1:
        raise ValueError("A resposta da IA não contém um JSON válido")

    cleaned = cleaned[json_start:]

    decoder = json.JSONDecoder()

    try:
        data, _ = decoder.raw_decode(cleaned)
        return data
    except json.JSONDecodeError as error:
        print("RESPOSTA BRUTA DA IA:")
        print(response_text)
        raise ValueError(f"Erro ao interpretar JSON da IA: {error}")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY não encontrada no arquivo .env")

client = genai.Client(api_key=GEMINI_API_KEY)


def generate_course_from_pdf_text(course_title: str, pdf_text: str):
    limited_text = pdf_text[:30000]

    prompt = f"""
Você é um especialista em criação de cursos técnicos para uma plataforma LMS chamada Sirros Academy.

Sua tarefa é transformar o conteúdo de um manual técnico em uma estrutura de curso online.

Curso base:
{course_title}

Texto extraído do PDF/manual:
\"\"\"
{limited_text}
\"\"\"

Regras obrigatórias:
- Responda APENAS em JSON válido.
- Não use markdown.
- Não use ```json.
- Não invente informações que não estejam no manual.
- Gere aulas em texto, não vídeos.
- O conteúdo das aulas deve ser didático, claro e técnico.
- Use linguagem simples para alunos/técnicos.
- Crie entre 3 e 6 módulos.
- Cada módulo deve ter entre 1 e 4 aulas.
- Cada aula deve ter título, descrição, conteúdo, duração estimada em minutos e ordem.
- O campo "conteudo" deve ter pelo menos 2 parágrafos.
- A ordem dos módulos e aulas deve seguir a lógica do manual.
- O conteúdo deve parecer uma aula de LMS, não apenas um resumo.

Formato obrigatório:

{{
  "titulo": "Nome do curso gerado",
  "descricao": "Descrição curta do curso",
  "modulos": [
    {{
      "titulo": "Nome do módulo",
      "ordem": 1,
      "aulas": [
        {{
          "titulo": "Nome da aula",
          "descricao": "Descrição curta da aula",
          "conteudo": "Conteúdo textual completo da aula.",
          "duracao": 10,
          "ordem": 1
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

    data = parse_ai_json_response(response_text)

    if "modulos" not in data or not isinstance(data["modulos"], list):
        raise ValueError("A IA retornou um JSON sem a lista de módulos")

    return data