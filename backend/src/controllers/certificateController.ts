import { Request, Response } from "express";
import { 
    createCertificateService, 
    getAllCertificatesService, 
    getCertificateByIdService, 
    updateCertificateService, 
    deleteCertificateService,
    getCertificateDetailsForPDF 
} from "../services/certificateService.js";
import { generateCertificatePDF } from "../services/pdfService.js";

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

export async function downloadCertificate(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        
        // 1. Get the stitched-together data
        const certificateData = await getCertificateDetailsForPDF(id);

        // 2. Tell the browser "Hey, a PDF file is coming!"
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=Certificado-${certificateData.aluno_nome.replace(/\s+/g, '-')}.pdf`);

        // 3. Generate and stream the PDF
        generateCertificatePDF(certificateData, res);
        
    } catch (error: any) {
        return res.status(404).json({ error: error.message });
    }
}