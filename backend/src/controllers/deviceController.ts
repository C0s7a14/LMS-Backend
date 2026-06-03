import { Request, Response } from "express";
import { createDeviceService, getDevicesService } from "../services/deviceService.js";

export async function createDeviceController(req: Request, res: Response) {
    try {
        const result = await createDeviceService(req.body);
        return res.status(201).json(result);
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export async function getDevicesController(req: Request, res: Response) {
    try {
        const result = await getDevicesService();
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
}