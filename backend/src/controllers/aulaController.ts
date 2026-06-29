import { Request, Response, NextFunction } from "express";

import {
  createAulaService,
  getAulasByModuloService,
  getAulaByIdService,
  updateAulaService,
  deleteAulaService,
  completeAulaService,
} from "../services/aulaService.js";

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

export async function createAulaController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const moduloId = validateNumberId(
      req.params.moduloId,
      "ID do módulo inválido"
    );

    const {
      titulo,
      descricao,
      conteudo,
      video_url,
      pdf_url,
      duracao,
      ordem,
      status,
    } = req.body;

    if (!titulo) {
      throw new AppError("Título da aula é obrigatório", 400);
    }

    const result = await createAulaService({
      modulo_id: moduloId,
      titulo,
      descricao,
      conteudo,
      video_url,
      pdf_url,
      duracao,
      ordem,
      status,
    });

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getAulasByModuloController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const moduloId = validateNumberId(
      req.params.moduloId,
      "ID do módulo inválido"
    );

    const aulas = await getAulasByModuloService(moduloId);

    return res.json(aulas);
  } catch (error) {
    next(error);
  }
}

export async function getAulaByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const aulaId = validateNumberId(
      req.params.id,
      "ID da aula inválido"
    );

    const aula = await getAulaByIdService(aulaId);

    return res.json(aula);
  } catch (error) {
    next(error);
  }
}

export async function updateAulaController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const aulaId = validateNumberId(
      req.params.id,
      "ID da aula inválido"
    );

    const result = await updateAulaService(
      aulaId,
      req.body
    );

    return res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function deleteAulaController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const aulaId = validateNumberId(
      req.params.id,
      "ID da aula inválido"
    );

    const result = await deleteAulaService(aulaId);

    return res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function completeAulaController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const aulaId = validateNumberId(
      req.params.id,
      "ID da aula inválido"
    );

    if (!req.user) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const { segundos_assistidos } = req.body;

    const result = await completeAulaService(
      req.user.id,
      aulaId,
      segundos_assistidos || 0
    );

    return res.json(result);
  } catch (error) {
    next(error);
  }
}