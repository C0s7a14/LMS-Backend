import { Request, Response, NextFunction } from "express";

import {
  createModuloService,
  getModulosByCourseService,
  getModuloByIdService,
  updateModuloService,
  deleteModuloService,
} from "../services/moduloService.js";

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

export async function createModuloController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const courseId = validateNumberId(
      req.params.courseId,
      "ID do curso inválido"
    );

    const { titulo, ordem } = req.body;

    if (!titulo) {
      throw new AppError("Título do módulo é obrigatório", 400);
    }

    const result = await createModuloService({
      curso_id: courseId,
      titulo,
      ordem,
    });

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getModulosByCourseController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const courseId = validateNumberId(
      req.params.courseId,
      "ID do curso inválido"
    );

    const modulos = await getModulosByCourseService(courseId);

    return res.json(modulos);
  } catch (error) {
    next(error);
  }
}

export async function getModuloByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const moduloId = validateNumberId(
      req.params.id,
      "ID do módulo inválido"
    );

    const modulo = await getModuloByIdService(moduloId);

    return res.json(modulo);
  } catch (error) {
    next(error);
  }
}

export async function updateModuloController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const moduloId = validateNumberId(
      req.params.id,
      "ID do módulo inválido"
    );

    const result = await updateModuloService(
      moduloId,
      req.body
    );

    return res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function deleteModuloController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const moduloId = validateNumberId(
      req.params.id,
      "ID do módulo inválido"
    );

    const result = await deleteModuloService(moduloId);

    return res.json(result);
  } catch (error) {
    next(error);
  }
}