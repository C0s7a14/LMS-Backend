import { Request, Response, NextFunction } from "express";

import { getCourseContentService } from "../services/courseContentService.js";
import { AppError } from "../middlewares/errorMiddleware.js";

function validateNumberId(
  id: string | string[] | undefined,
  message: string
) {
  if (!id || Array.isArray(id) || Number.isNaN(Number(id))) {
    throw new AppError(message, 400);
  }

  return Number(id);
}

export async function getCourseContentController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const courseId = validateNumberId(
      req.params.courseId,
      "ID do curso inválido"
    );

    if (!req.user) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const content = await getCourseContentService(
      courseId,
      req.user.id
    );

    return res.json(content);
  } catch (error) {
    next(error);
  }
}