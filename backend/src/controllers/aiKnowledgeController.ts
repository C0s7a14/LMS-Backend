import type { Request, Response, NextFunction } from "express";

import {
  createAiPromptService,
  createDeviceDocumentService,
  deleteDeviceDocumentService,
  getAiKnowledgeSummaryService,
  getAiPromptsService,
  getDeviceDocumentsService,
  processDeviceDocumentService,
  updateAiPromptService,
  getAiDevicesService,
} from "../services/aiKnowledgeService.js";

export async function getAiPromptsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const prompts = await getAiPromptsService();

    return res.status(200).json(prompts);
  } catch (error) {
    next(error);
  }
}

export async function createAiPromptController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    const userId = Number(user?.id || user?.userId);

    const { nome, conteudo, dispositivo_id, ativo } = req.body;

    const prompt = await createAiPromptService({
      nome,
      conteudo,
      dispositivo_id: dispositivo_id ? Number(dispositivo_id) : null,
      ativo,
      criado_por: userId,
    });

    return res.status(201).json(prompt);
  } catch (error) {
    next(error);
  }
}

export async function updateAiPromptController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const promptId = Number(req.params.promptId);

    const { nome, conteudo, dispositivo_id, ativo } = req.body;

    const prompt = await updateAiPromptService(promptId, {
      nome,
      conteudo,
      dispositivo_id: dispositivo_id ? Number(dispositivo_id) : null,
      ativo,
    });

    return res.status(200).json(prompt);
  } catch (error) {
    next(error);
  }
}

export async function getDeviceDocumentsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const deviceId = Number(req.params.deviceId);

    const documents = await getDeviceDocumentsService(deviceId);

    return res.status(200).json(documents);
  } catch (error) {
    next(error);
  }
}

export async function createDeviceDocumentController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    const userId = Number(user?.id || user?.userId);

    const deviceId = Number(req.params.deviceId);

    if (!req.file) {
      return res.status(400).json({
        message: "Arquivo PDF é obrigatório.",
      });
    }

    const { titulo, descricao } = req.body;

    const document = await createDeviceDocumentService({
      dispositivo_id: deviceId,
      titulo: titulo || req.file.originalname,
      descricao: descricao || null,
      nome_arquivo_original: req.file.originalname,
      arquivo_url: req.file.path,
      tipo_arquivo: "pdf",
      tamanho_bytes: req.file.size,
      criado_por: userId,
    });

    return res.status(201).json(document);
  } catch (error) {
    next(error);
  }
}

export async function processDeviceDocumentController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const documentId = Number(req.params.documentId);

    const result = await processDeviceDocumentService(documentId);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function deleteDeviceDocumentController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const documentId = Number(req.params.documentId);

    const result = await deleteDeviceDocumentService(documentId);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getAiKnowledgeSummaryController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const summary = await getAiKnowledgeSummaryService();

    return res.status(200).json(summary);
  } catch (error) {
    next(error);
  }
}

export async function getAiDevicesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const devices = await getAiDevicesService();

    return res.status(200).json(devices);
  } catch (error) {
    next(error);
  }
}
