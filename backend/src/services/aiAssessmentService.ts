import { pool } from "../database/connection.js";
import { AppError } from "../middlewares/errorMiddleware.js";

import {
  generateModuleQuizWithAiService,
  generateFinalExamWithAiService,
} from "./aiQuizService.js";

interface GenerateAssessmentsOptions {
  moduleQuestions?: number;
  finalExamQuestions?: number;
  status?: "rascunho" | "publicado";
  nota_minima?: number;
  max_tentativas?: number;
}

export async function generateCourseAssessmentsWithAiService(
  courseId: number,
  options: GenerateAssessmentsOptions = {}
) {
  const [courseRows]: any = await pool.query(
    `
    SELECT id, titulo
    FROM cursos
    WHERE id = ?
    LIMIT 1
    `,
    [courseId]
  );

  if (courseRows.length === 0) {
    throw new AppError("Curso não encontrado", 404);
  }

  const [moduleRows]: any = await pool.query(
    `
    SELECT id, titulo
    FROM modulos
    WHERE curso_id = ?
    ORDER BY ordem ASC
    `,
    [courseId]
  );

  if (moduleRows.length === 0) {
    throw new AppError("Este curso ainda não possui módulos", 400);
  }

  const generatedModuleQuizzes = [];

  for (const module of moduleRows) {
    const quiz = await generateModuleQuizWithAiService(module.id, {
      totalQuestions: options.moduleQuestions || 10,
      status: options.status || "publicado",
      nota_minima: options.nota_minima || 70,
      max_tentativas: options.max_tentativas || 3,
    });

    generatedModuleQuizzes.push({
      modulo_id: module.id,
      modulo_titulo: module.titulo,
      quiz,
    });
  }

  const finalExam = await generateFinalExamWithAiService(courseId, {
    totalQuestions: options.finalExamQuestions || 20,
    status: options.status || "publicado",
    nota_minima: options.nota_minima || 70,
    max_tentativas: options.max_tentativas || 3,
  });

  return {
    message: "Avaliações geradas com sucesso",
    course_id: courseId,
    total_module_quizzes: generatedModuleQuizzes.length,
    module_quizzes: generatedModuleQuizzes,
    final_exam: finalExam,
  };
}