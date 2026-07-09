from pydantic import BaseModel


class GenerateCourseRequest(BaseModel):
    courseTitle: str
    pdfText: str


class AulaResponse(BaseModel):
    titulo: str
    descricao: str
    conteudo: str
    duracao: int
    ordem: int


class ModuloResponse(BaseModel):
    titulo: str
    ordem: int
    aulas: list[AulaResponse]


class GenerateCourseResponse(BaseModel):
    titulo: str
    descricao: str
    modulos: list[ModuloResponse]