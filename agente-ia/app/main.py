import traceback

from fastapi import FastAPI, HTTPException

from app.schemas.course_schema import GenerateCourseRequest
from app.services.course_generator import generate_course_from_pdf_text

app = FastAPI(
    title="Sirros Academy IA",
    description="Agente de IA para gerar cursos, módulos e aulas a partir de PDFs.",
    version="1.0.0",
)


@app.get("/")
def health_check():
    return {
        "message": "Serviço de IA rodando"
    }


@app.post("/ai/course/generate")
def generate_course(request: GenerateCourseRequest):
    try:
        if not request.courseTitle.strip():
            raise HTTPException(
                status_code=400,
                detail="O título do curso é obrigatório",
            )

        if not request.pdfText.strip():
            raise HTTPException(
                status_code=400,
                detail="O texto do PDF é obrigatório",
            )

        print("Recebendo texto para gerar curso...")
        print("Curso:", request.courseTitle)
        print("Tamanho do texto:", len(request.pdfText))

        result = generate_course_from_pdf_text(
            course_title=request.courseTitle,
            pdf_text=request.pdfText,
        )

        return {
            "message": "Curso gerado com sucesso",
            "course": result,
        }

    except HTTPException:
        raise

    except Exception as error:
        print("ERRO REAL AO GERAR CURSO:")
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )