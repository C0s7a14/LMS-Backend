import { Request, Response, NextFunction } from "express";

import {
  createCourseService,
  getCoursesService,
  getCoursesByIdService,
  deleteCoursesService,
  updateCourseService,
} from "../services/courseService.js";

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

export async function createCourseController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      titulo,
      descricao,
      thumbnail,
      criado_por,
    } = req.body;

    if (!titulo) {
      throw new AppError(
        "Título do curso é obrigatório",
        400
      );
    }

    if (!criado_por) {
      throw new AppError(
        "ID do criador é obrigatório",
        400
      );
    }

    const result =
      await createCourseService({
        titulo,
        descricao,
        thumbnail,
        criado_por,
      });

    return res.status(201).json(result);
  } catch (error) {
    handleControllerError(error, next, 400);
  }
}

export async function getCoursesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const courses =
      await getCoursesService();

    return res.json(courses);
  } catch (error) {
    handleControllerError(error, next, 400);
  }
}

export async function getCourseByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    if (!id || Number.isNaN(Number(id))) {
      throw new AppError(
        "ID do curso inválido",
        400
      );
    }

    const course =
      await getCoursesByIdService(
        Number(id)
      );

    return res.json(course);
  } catch (error) {
    handleControllerError(error, next, 404);
  }
}

export async function deleteCourseController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    if (!id || Number.isNaN(Number(id))) {
      throw new AppError(
        "ID do curso inválido",
        400
      );
    }

    const result =
      await deleteCoursesService(
        Number(id)
      );

    return res.json(result);
  } catch (error) {
  next(error);
}
}

export async function updateCourseController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    const {
      titulo,
      descricao,
      thumbnail,
    } = req.body;

    if (!id || Number.isNaN(Number(id))) {
      throw new AppError(
        "ID do curso inválido",
        400
      );
    }

    const result =
      await updateCourseService(
        Number(id),
        titulo,
        descricao,
        thumbnail
      );

    return res.json(result);
  } catch (error) {
    handleControllerError(error, next, 400);
  }
}