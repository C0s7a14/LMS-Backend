from pydantic import BaseModel


class GenerateQuizRequest(BaseModel):
    title: str
    content: str
    quizType: str
    totalQuestions: int = 5


class QuizOptionResponse(BaseModel):
    texto_opcao: str
    correta: bool


class QuizQuestionResponse(BaseModel):
    pergunta: str
    explicacao: str | None = None
    ordem: int
    opcoes: list[QuizOptionResponse]


class GenerateQuizResponse(BaseModel):
    titulo: str
    questoes: list[QuizQuestionResponse]