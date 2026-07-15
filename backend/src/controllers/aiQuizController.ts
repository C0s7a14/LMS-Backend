import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { AppError } from "../middlewares/errorMiddleware.js";

import {
  generateLessonQuizWithAiService,
  generateModuleQuizWithAiService,
  generateFinalExamWithAiService,
} from "../services/aiQuizService.js";

function getOptionsFromBody(body: any) {
  return {
    totalQuestions: body.totalQuestions ? Number(body.totalQuestions) : undefined,
    nota_minima: body.nota_minima ? Number(body.nota_minima) : undefined,
    max_tentativas: body.max_tentativas ? Number(body.max_tentativas) : undefined,
    status: body.status || "rascunho",
  };
}

export async function generateLessonQuizWithAiController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { aulaId } = req.params;

    if (!aulaId || Number.isNaN(Number(aulaId))) {
      throw new AppError("ID da aula inválido", 400);
    }

    const result = await generateLessonQuizWithAiService(
      Number(aulaId),
      getOptionsFromBody(req.body)
    );

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function generateModuleQuizWithAiController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { moduloId } = req.params;

    if (!moduloId || Number.isNaN(Number(moduloId))) {
      throw new AppError("ID do módulo inválido", 400);
    }

    const result = await generateModuleQuizWithAiService(
      Number(moduloId),
      getOptionsFromBody(req.body)
    );

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function generateFinalExamWithAiController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { courseId } = req.params;

    if (!courseId || Number.isNaN(Number(courseId))) {
      throw new AppError("ID do curso inválido", 400);
    }

    const result = await generateFinalExamWithAiService(
      Number(courseId),
      getOptionsFromBody(req.body)
    );

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}