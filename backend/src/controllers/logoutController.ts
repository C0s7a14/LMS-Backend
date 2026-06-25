import { Request, Response, NextFunction } from "express";

import { logoutService } from "../services/authService.js";
import { AppError } from "../middlewares/errorMiddleware.js";

export async function logoutController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError(
        "Refresh token não enviado",
        400
      );
    }

    const result = await logoutService(
      refreshToken
    );

    return res.json(result);
  } catch (error) {
    next(error);
  }
}