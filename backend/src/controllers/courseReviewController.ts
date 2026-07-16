import type { Request, Response, NextFunction } from "express";

import { AppError } from "../middlewares/errorMiddleware.js";

import {
  completeCourseReviewService,
  getCourseReviewStatusService,
} from "../services/courseReviewService.js";

export async function getCourseReviewStatusController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { courseId } = req.params;

    if (!courseId || Number.isNaN(Number(courseId))) {
      throw new AppError("ID do curso inválido", 400);
    }

    const user = (req as any).user;
    const userId = Number(user?.id || user?.userId);

    if (!userId || Number.isNaN(userId)) {
      throw new AppError("Usuário autenticado não identificado", 401);
    }

    const result = await getCourseReviewStatusService(
      Number(courseId),
      userId
    );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function completeCourseReviewController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { courseId } = req.params;

    if (!courseId || Number.isNaN(Number(courseId))) {
      throw new AppError("ID do curso inválido", 400);
    }

    const user = (req as any).user;
    const userId = Number(user?.id || user?.userId);

    if (!userId || Number.isNaN(userId)) {
      throw new AppError("Usuário autenticado não identificado", 401);
    }

    const result = await completeCourseReviewService(
      Number(courseId),
      userId
    );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}