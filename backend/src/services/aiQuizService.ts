import axios from "axios";

import { pool } from "../database/connection.js";
import { AppError } from "../middlewares/errorMiddleware.js";
import { createQuizService } from "./quizService.js";

type QuizStatus = "rascunho" | "publicado";

interface GenerateQuizOptions {
  totalQuestions?: number;
  nota_minima?: number;
  max_tentativas?: number;
  status?: QuizStatus;
}

const AI_API_URL = process.env.AI_API_URL || "http://localhost:8000";

async function callAiQuizGenerator(data: {
  title: string;
  content: string;
  quizType: "aula" | "modulo" | "prova_final";
  totalQuestions: number;
}) {
  const response = await axios.post(`${AI_API_URL}/ai/quiz/generate`, {
    title: data.title,
    content: data.content,
    quizType: data.quizType,
    totalQuestions: data.totalQuestions,
  });

  return response.data.quiz;
}

export async function generateLessonQuizWithAiService(
  aulaId: number,
  options: GenerateQuizOptions
) {
  const [lessonRows]: any = await pool.query(
    `
      SELECT
        a.id AS aula_id,
        a.titulo AS aula_titulo,
        a.descricao,
        a.conteudo,
        a.modulo_id,
        m.curso_id,
        m.titulo AS modulo_titulo
      FROM aulas a
      INNER JOIN modulos m ON m.id = a.modulo_id
      WHERE a.id = ?
    `,
    [aulaId]
  );

  if (lessonRows.length === 0) {
    throw new AppError("Aula não encontrada", 404);
  }

  const lesson = lessonRows[0];

  if (!lesson.conteudo && !lesson.descricao) {
    throw new AppError("A aula não possui conteúdo suficiente para gerar quiz", 400);
  }

  const content = `
Curso ID: ${lesson.curso_id}
Módulo: ${lesson.modulo_titulo}
Aula: ${lesson.aula_titulo}

Descrição:
${lesson.descricao || ""}

Conteúdo:
${lesson.conteudo || ""}
  `;

  const generatedQuiz = await callAiQuizGenerator({
    title: `Quiz - ${lesson.aula_titulo}`,
    content,
    quizType: "aula",
    totalQuestions: options.totalQuestions || 5,
  });

  const savedQuiz = await createQuizService({
    curso_id: lesson.curso_id,
    modulo_id: lesson.modulo_id,
    aula_id: lesson.aula_id,
    titulo: generatedQuiz.titulo || `Quiz - ${lesson.aula_titulo}`,
    tipo: "aula",
    nota_minima: options.nota_minima || 70,
    max_tentativas: options.max_tentativas || 3,
    status: options.status || "rascunho",
    questoes: generatedQuiz.questoes,
  });

  return {
    message: "Quiz da aula gerado com IA e salvo com sucesso",
    quiz: {
      ...savedQuiz,
      titulo: generatedQuiz.titulo,
      tipo: "aula",
      status: options.status || "rascunho",
      questoes: generatedQuiz.questoes,
    },
  };
}

export async function generateModuleQuizWithAiService(
  moduloId: number,
  options: GenerateQuizOptions
) {
  const [moduleRows]: any = await pool.query(
    `
      SELECT
        id,
        curso_id,
        titulo
      FROM modulos
      WHERE id = ?
    `,
    [moduloId]
  );

  if (moduleRows.length === 0) {
    throw new AppError("Módulo não encontrado", 404);
  }

  const module = moduleRows[0];

  const [lessonRows]: any = await pool.query(
    `
      SELECT
        titulo,
        descricao,
        conteudo,
        ordem
      FROM aulas
      WHERE modulo_id = ?
      ORDER BY ordem ASC
    `,
    [moduloId]
  );

  if (lessonRows.length === 0) {
    throw new AppError("O módulo não possui aulas para gerar quiz", 400);
  }

  const content = lessonRows
    .map((lesson: any) => {
      return `
Aula ${lesson.ordem}: ${lesson.titulo}

Descrição:
${lesson.descricao || ""}

Conteúdo:
${lesson.conteudo || ""}
`;
    })
    .join("\n\n");

  const generatedQuiz = await callAiQuizGenerator({
    title: `Quiz do módulo - ${module.titulo}`,
    content,
    quizType: "modulo",
    totalQuestions: options.totalQuestions || 5,
  });

  const savedQuiz = await createQuizService({
    curso_id: module.curso_id,
    modulo_id: module.id,
    aula_id: null,
    titulo: generatedQuiz.titulo || `Quiz do módulo - ${module.titulo}`,
    tipo: "modulo",
    nota_minima: options.nota_minima || 70,
    max_tentativas: options.max_tentativas || 3,
    status: options.status || "rascunho",
    questoes: generatedQuiz.questoes,
  });

  return {
    message: "Quiz do módulo gerado com IA e salvo com sucesso",
    quiz: {
      ...savedQuiz,
      titulo: generatedQuiz.titulo,
      tipo: "modulo",
      status: options.status || "rascunho",
      questoes: generatedQuiz.questoes,
    },
  };
}

export async function generateFinalExamWithAiService(
  courseId: number,
  options: GenerateQuizOptions
) {
  const [courseRows]: any = await pool.query(
    `
      SELECT
        id,
        titulo,
        descricao
      FROM cursos
      WHERE id = ?
    `,
    [courseId]
  );

  if (courseRows.length === 0) {
    throw new AppError("Curso não encontrado", 404);
  }

  const course = courseRows[0];

  const [lessonRows]: any = await pool.query(
    `
      SELECT
        m.titulo AS modulo_titulo,
        m.ordem AS modulo_ordem,
        a.titulo AS aula_titulo,
        a.descricao,
        a.conteudo,
        a.ordem AS aula_ordem
      FROM modulos m
      LEFT JOIN aulas a ON a.modulo_id = m.id
      WHERE m.curso_id = ?
      ORDER BY m.ordem ASC, a.ordem ASC
    `,
    [courseId]
  );

  if (lessonRows.length === 0) {
    throw new AppError("O curso não possui conteúdo para gerar prova final", 400);
  }

  const content = `
Curso:
${course.titulo}

Descrição:
${course.descricao || ""}

Conteúdo das aulas:
${lessonRows
  .map((item: any) => {
    return `
Módulo ${item.modulo_ordem}: ${item.modulo_titulo}
Aula ${item.aula_ordem}: ${item.aula_titulo}

Descrição:
${item.descricao || ""}

Conteúdo:
${item.conteudo || ""}
`;
  })
  .join("\n\n")}
  `;

  const generatedQuiz = await callAiQuizGenerator({
    title: `Prova Final - ${course.titulo}`,
    content,
    quizType: "prova_final",
    totalQuestions: options.totalQuestions || 10,
  });

  const savedQuiz = await createQuizService({
    curso_id: course.id,
    modulo_id: null,
    aula_id: null,
    titulo: generatedQuiz.titulo || `Prova Final - ${course.titulo}`,
    tipo: "prova_final",
    nota_minima: options.nota_minima || 70,
    max_tentativas: options.max_tentativas || 3,
    status: options.status || "rascunho",
    questoes: generatedQuiz.questoes,
  });

  return {
    message: "Prova final gerada com IA e salva com sucesso",
    quiz: {
      ...savedQuiz,
      titulo: generatedQuiz.titulo,
      tipo: "prova_final",
      status: options.status || "rascunho",
      questoes: generatedQuiz.questoes,
    },
  };
}