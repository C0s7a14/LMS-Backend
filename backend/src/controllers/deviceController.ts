import { Request, Response, NextFunction } from "express";

import {
  createDeviceService,
  getDevicesService,
  getDeviceByIdService,
  updateDeviceService,
  deleteDeviceService,
  attachDeviceToCourseService,
  getDevicesByCourseService,
  detachDeviceFromCourseService,
} from "../services/deviceService.js";

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

export async function createDeviceController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { nome } = req.body;

    if (!nome) {
      throw new AppError(
        "Nome do dispositivo é obrigatório",
        400
      );
    }

    const result = await createDeviceService(req.body);

    return res.status(201).json(result);
  } catch (error) {
    handleControllerError(error, next, 400);
  }
}

export async function getDevicesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await getDevicesService();

    return res.json(result);
  } catch (error) {
    handleControllerError(error, next, 400);
  }
}

export async function getDeviceByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    if (!id || Number.isNaN(Number(id))) {
      throw new AppError(
        "ID do dispositivo inválido",
        400
      );
    }

    const result = await getDeviceByIdService(
      Number(id)
    );

    return res.json(result);
  } catch (error) {
    handleControllerError(error, next, 404);
  }
}

export async function updateDeviceController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    if (!id || Number.isNaN(Number(id))) {
      throw new AppError(
        "ID do dispositivo inválido",
        400
      );
    }

    const result = await updateDeviceService(
      Number(id),
      req.body
    );

    return res.json(result);
  } catch (error) {
    handleControllerError(error, next, 400);
  }
}

export async function deleteDeviceController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    if (!id || Number.isNaN(Number(id))) {
      throw new AppError(
        "ID do dispositivo inválido",
        400
      );
    }

    const result = await deleteDeviceService(
      Number(id)
    );

    return res.json(result);
  } catch (error) {
    handleControllerError(error, next, 400);
  }
}

export async function attachDeviceToCourseController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      courseId,
      deviceId,
    } = req.params;

    if (
      !courseId ||
      Number.isNaN(Number(courseId)) ||
      !deviceId ||
      Number.isNaN(Number(deviceId))
    ) {
      throw new AppError(
        "ID do curso ou do dispositivo inválido",
        400
      );
    }

    const result = await attachDeviceToCourseService(
      Number(courseId),
      Number(deviceId)
    );

    return res.status(201).json(result);
  } catch (error) {
    handleControllerError(error, next, 400);
  }
}

export async function getDevicesByCourseController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { courseId } = req.params;

    if (!courseId || Number.isNaN(Number(courseId))) {
      throw new AppError(
        "ID do curso inválido",
        400
      );
    }

    const result = await getDevicesByCourseService(
      Number(courseId)
    );

    return res.json(result);
  } catch (error) {
    handleControllerError(error, next, 400);
  }
}

export async function detachDeviceFromCourseController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      courseId,
      deviceId,
    } = req.params;

    if (
      !courseId ||
      Number.isNaN(Number(courseId)) ||
      !deviceId ||
      Number.isNaN(Number(deviceId))
    ) {
      throw new AppError(
        "ID do curso ou do dispositivo inválido",
        400
      );
    }

    const result = await detachDeviceFromCourseService(
      Number(courseId),
      Number(deviceId)
    );

    return res.json(result);
  } catch (error) {
    handleControllerError(error, next, 400);
  }
}