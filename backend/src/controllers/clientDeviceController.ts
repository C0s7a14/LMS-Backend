import { Request, Response } from "express";

import {
  getClientDevicesService,
  linkDeviceToClientService,
  unlinkDeviceFromClientService,
} from "../services/clientDeviceService.js";

export async function getClientDevicesController(
  req: Request,
  res: Response
) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    const devices = await getClientDevicesService(userId);

    return res.json(devices);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Erro ao buscar dispositivos do cliente.",
    });
  }
}

export async function linkDeviceToClientController(
  req: Request,
  res: Response
) {
  try {
    const { clientId, deviceId } = req.params;

    const result = await linkDeviceToClientService(
      Number(clientId),
      Number(deviceId)
    );

    return res.status(201).json(result);
  } catch (error: any) {
    console.log(error);

    return res.status(400).json({
      message: error.message || "Erro ao vincular dispositivo ao cliente.",
    });
  }
}

export async function unlinkDeviceFromClientController(
  req: Request,
  res: Response
) {
  try {
    const { clientId, deviceId } = req.params;

    const result = await unlinkDeviceFromClientService(
      Number(clientId),
      Number(deviceId)
    );

    return res.json(result);
  } catch (error: any) {
    console.log(error);

    return res.status(400).json({
      message: error.message || "Erro ao remover dispositivo do cliente.",
    });
  }
}

export async function getAdminClientDevicesController(
  req: Request,
  res: Response
) {
  try {
    const { clientId } = req.params;

    if (!clientId) {
      return res.status(400).json({
        message: "Cliente não informado.",
      });
    }

    const devices = await getClientDevicesService(Number(clientId));

    return res.json(devices);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Erro ao buscar dispositivos do cliente.",
    });
  }
}