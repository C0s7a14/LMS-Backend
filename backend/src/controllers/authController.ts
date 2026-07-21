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

export async function loginController(req: Request, res: Response) {
  try {
    const result = await loginService(req.body);

    return res.status(200).json(result);
  } catch (error: any) {
    const message = error.message || "Erro ao fazer login.";

    if (
      message === "Usuário não encontrado" ||
      message === "Senha inválida" ||
      message === "E-mail não encontrado"
    ) {
      console.log(`Login recusado: ${message}`);

      return res.status(401).json({
        error: message,
      });
    }

    console.error("Erro inesperado no login:", message);

    return res.status(500).json({
      error: "Erro interno no servidor.",
    });
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

export async function logoutController(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    const result = await logoutService(refreshToken);

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({
      error: error.message || "Erro ao fazer logout.",
    });
  }
}