import type { Request, Response, NextFunction } from "express";

import { AppError } from "../middlewares/errorMiddleware.js";
import { getStudentHomeService } from "../services/studentHomeService.js";

export async function getStudentHomeController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    const userId = Number(user?.id || user?.userId);

    if (!userId || Number.isNaN(userId)) {
      throw new AppError("Usuário autenticado não identificado", 401);
    }

    const result = await getStudentHomeService(userId);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}