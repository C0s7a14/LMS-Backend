import { Request, Response, NextFunction } from "express";

import {
  getUsersService,
  getUserByIdService,
  updateUserService,
  deleteUserService,
} from "../services/userService.js";

import { AppError } from "../middlewares/errorMiddleware.js";

function handleControllerError(
  error: unknown,
  next: NextFunction,
  statusCode = 400
) {
  if (error instanceof AppError) {
    return next(error);
  }

  if (error instanceof Error) {
    return next(
      new AppError(error.message, statusCode)
    );
  }

  return next(
    new AppError("Erro inesperado", statusCode)
  );
}

export async function getUsersController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const users =
      await getUsersService();

    return res.json(users);
  } catch (error) {
    handleControllerError(error, next, 400);
  }
}

export async function getUserByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    if (!id || Number.isNaN(Number(id))) {
      throw new AppError(
        "ID do usuário inválido",
        400
      );
    }

    const user =
      await getUserByIdService(
        Number(id)
      );

    return res.json(user);
  } catch (error) {
    handleControllerError(error, next, 400);
  }
}

export async function updateUserController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      senha,
      role,
    } = req.body;

    if (!id || Number.isNaN(Number(id))) {
      throw new AppError(
        "ID do usuário inválido",
        400
      );
    }

    const result =
      await updateUserService(
        Number(id),
        {
          name,
          email,
          senha,
          role,
        }
      );

    return res.json(result);
  } catch (error) {
    handleControllerError(error, next, 400);
  }
}

export async function deleteUserController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    if (!id || Number.isNaN(Number(id))) {
      throw new AppError(
        "ID do usuário inválido",
        400
      );
    }

    const result =
      await deleteUserService(
        Number(id)
      );

    return res.json(result);
  } catch (error) {
    handleControllerError(error, next, 400);
  }
}