import type { Request, Response, NextFunction } from "express";

import { AppError } from "../middlewares/errorMiddleware.js";
import { generateCourseAssessmentsWithAiService } from "../services/aiAssessmentService.js";

export async function generateCourseAssessmentsWithAiController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { courseId } = req.params;

    if (!courseId || Number.isNaN(Number(courseId))) {
      throw new AppError("ID do curso inválido", 400);
    }

    const result = await generateCourseAssessmentsWithAiService(
      Number(courseId),
      {
        moduleQuestions: req.body.moduleQuestions,
        finalExamQuestions: req.body.finalExamQuestions,
        status: req.body.status || "publicado",
        nota_minima: req.body.nota_minima || 70,
        max_tentativas: req.body.max_tentativas || 3,
      }
    );

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}