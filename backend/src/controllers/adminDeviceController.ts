import { Request, Response } from "express";
import {
  deleteAdminDeviceService,
  updateAdminDeviceService,
} from "../services/adminDeviceService.js";

export async function updateAdminDeviceController(req: Request, res: Response) {
  try {
    const deviceId = Number(req.params.deviceId);

    const device = await updateAdminDeviceService(deviceId, req.body);

    return res.status(200).json(device);
  } catch (error: any) {
    console.log(error);

    return res.status(400).json({
      error: error.message || "Erro ao atualizar dispositivo.",
    });
  }
}

export async function deleteAdminDeviceController(req: Request, res: Response) {
  try {
    const deviceId = Number(req.params.deviceId);

    const result = await deleteAdminDeviceService(deviceId);

    return res.status(200).json(result);
  } catch (error: any) {
    console.log(error);

    return res.status(400).json({
      error: error.message || "Erro ao excluir dispositivo.",
    });
  }
}