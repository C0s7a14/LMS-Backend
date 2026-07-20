import traceback

from fastapi import FastAPI, HTTPException

from app.schemas.course_schema import GenerateCourseRequest
from app.services.course_generator import generate_course_from_pdf_text

from app.schemas.quiz_schema import GenerateQuizRequest
from app.services.quiz_generator import generate_quiz_from_content

from app.routes.ai_chat_routes import router as ai_chat_router


app = FastAPI(
    title="Sirros Academy IA",
    description="Agente de IA para gerar cursos, módulos, aulas, quizzes e responder dúvidas técnicas.",
    version="1.0.0",
)

app.include_router(ai_chat_router)


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


@app.post("/ai/quiz/generate")
def generate_quiz(request: GenerateQuizRequest):
    try:
        if not request.title.strip():
            raise HTTPException(
                status_code=400,
                detail="O título da avaliação é obrigatório",
            )

        if not request.content.strip():
            raise HTTPException(
                status_code=400,
                detail="O conteúdo base é obrigatório",
            )

        if request.totalQuestions < 1:
            raise HTTPException(
                status_code=400,
                detail="A avaliação precisa ter pelo menos uma questão",
            )

        result = generate_quiz_from_content(
            title=request.title,
            content=request.content,
            quiz_type=request.quizType,
            total_questions=request.totalQuestions,
        )

        return {
            "message": "Quiz gerado com sucesso",
            "quiz": result,
        }

    except HTTPException:
        raise

    except Exception as error:
        print("ERRO AO GERAR QUIZ:")
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )