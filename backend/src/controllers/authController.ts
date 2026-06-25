import { Request, Response, NextFunction } from "express";

import {
  loginService,
  registerService,
  refreshTokenService,
  logoutService,
} from "../services/authService.js";

import { AppError } from "../middlewares/errorMiddleware.js";

export async function registerController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { name, email, senha, role } = req.body;

    if (!name || !email || !senha) {
      throw new AppError("Nome, email e senha são obrigatórios", 400);
    }

    await registerService({
      name,
      email,
      senha,
      role,
    });

    return res.status(201).json({
      message: "Usuário criado com sucesso",
    });
  } catch (error) {
    next(error);
  }
}

export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      throw new AppError("Email e senha são obrigatórios", 400);
    }

    const result = await loginService({
      email,
      senha,
    });

    return res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function refreshController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError("Refresh token não enviado", 401);
    }

    const result = await refreshTokenService(refreshToken);

    return res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function logoutController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log("LOGOUT CONTROLLER");

  try {
    console.log(req.body);

    const { refreshToken } = req.body;

    console.log(refreshToken);

    if (!refreshToken) {
      throw new AppError("Refresh token não enviado", 400);
    }

    const result = await logoutService(refreshToken);

    return res.json(result);
  } catch (error) {
    next(error);
  }
}