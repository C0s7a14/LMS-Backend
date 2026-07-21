import { Request, Response } from "express";
import {
  getAdminClientDevicesService,
  getClientDeviceDetailsService,
  getClientDeviceDocumentDownloadService,
  getClientDevicesService,
  linkDeviceToClientService,
  listClientDeviceDocumentsService,
  unlinkDeviceFromClientService,
} from "../services/clientDeviceService.js";

export async function getClientDevicesController(req: Request, res: Response) {
  try {
    const clientId = Number((req as any).user.id);

    const devices = await getClientDevicesService(clientId);

    return res.status(200).json(devices);
  } catch (error: any) {
    console.log(error);

    return res.status(400).json({
      error: error.message || "Erro ao carregar dispositivos.",
    });
  }
}

export async function getAdminClientDevicesController(
  req: Request,
  res: Response
) {
  try {
    const clientId = Number(req.params.clientId);

    const devices = await getAdminClientDevicesService(clientId);

    return res.status(200).json(devices);
  } catch (error: any) {
    console.log(error);

    return res.status(400).json({
      error: error.message || "Erro ao carregar dispositivos do cliente.",
    });
  }
}

export async function linkDeviceToClientController(
  req: Request,
  res: Response
) {
  try {
    const clientId = Number(req.params.clientId);
    const deviceId = Number(req.params.deviceId);

    const result = await linkDeviceToClientService(clientId, deviceId);

    return res.status(201).json(result);
  } catch (error: any) {
    console.log(error);

    return res.status(400).json({
      error: error.message || "Erro ao vincular dispositivo ao cliente.",
    });
  }
}

export async function unlinkDeviceFromClientController(
  req: Request,
  res: Response
) {
  try {
    const clientId = Number(req.params.clientId);
    const deviceId = Number(req.params.deviceId);

    const result = await unlinkDeviceFromClientService(clientId, deviceId);

    return res.status(200).json(result);
  } catch (error: any) {
    console.log(error);

    return res.status(400).json({
      error: error.message || "Erro ao remover dispositivo do cliente.",
    });
  }
}

export async function getClientDeviceDetailsController(
  req: Request,
  res: Response
) {
  try {
    const clientId = Number((req as any).user.id);
    const deviceId = Number(req.params.deviceId);

    const device = await getClientDeviceDetailsService(clientId, deviceId);

    return res.status(200).json(device);
  } catch (error: any) {
    console.log(error);

    return res.status(400).json({
      error: error.message || "Erro ao carregar dispositivo.",
    });
  }
}

export async function listClientDeviceDocumentsController(
  req: Request,
  res: Response
) {
  try {
    const clientId = Number((req as any).user.id);
    const deviceId = Number(req.params.deviceId);

    const documents = await listClientDeviceDocumentsService(clientId, deviceId);

    return res.status(200).json(documents);
  } catch (error: any) {
    console.log(error);

    return res.status(400).json({
      error: error.message || "Erro ao carregar documentos do dispositivo.",
    });
  }
}

export async function downloadClientDeviceDocumentController(
  req: Request,
  res: Response
) {
  try {
    const clientId = Number((req as any).user.id);
    const documentId = Number(req.params.documentId);

    const { document, filePath } = await getClientDeviceDocumentDownloadService(
      clientId,
      documentId
    );

   return res.download(
  filePath,
  document.nome_arquivo_original || document.titulo || "documento.pdf"
);
  } catch (error: any) {
    console.log(error);

    return res.status(400).json({
      error: error.message || "Erro ao baixar documento.",
    });
  }
}