import { Request, Response } from "express";
import { 
    createCertificateService, 
    getAllCertificatesService, 
    getCertificateByIdService, 
    updateCertificateService, 
    deleteCertificateService 
} from "../services/certificateService.js";

export async function createCertificate(req: Request, res: Response) {
    try {
        const result = await createCertificateService(req.body);
        return res.status(201).json(result);
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export async function getAllCertificates(req: Request, res: Response) {
    try {
        const result = await getAllCertificatesService();
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export async function getCertificateById(req: Request, res: Response) {
    try {
        // Convert the string from the URL into a strict number
        const id = Number(req.params.id); 
        const result = await getCertificateByIdService(id);
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(404).json({ error: error.message });
    }
}

export async function updateCertificate(req: Request, res: Response) {
    try {
        // Convert the string from the URL into a strict number
        const id = Number(req.params.id);
        const result = await updateCertificateService(id, req.body);
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}

export async function deleteCertificate(req: Request, res: Response) {
    try {
        // Convert the string from the URL into a strict number
        const id = Number(req.params.id);
        const result = await deleteCertificateService(id);
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}