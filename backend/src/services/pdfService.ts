import PDFDocument from "pdfkit";
import { Response } from "express";

export function generateCertificatePDF(data: any, res: Response) {
    // Create a new PDF document in Landscape mode
    const doc = new PDFDocument({
        layout: "landscape",
        size: "A4",
        margin: 50
    });

    // Pipe the PDF directly to the Express response (Streaming)
    doc.pipe(res);

    // --- DRAWING THE CERTIFICATE ---
    
    // Add a border (optional, but looks professional)
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();

    doc.moveDown(3);
    doc.fontSize(40).font("Helvetica-Bold").text("CERTIFICADO DE CONCLUSÃO", { align: "center" });
    
    doc.moveDown(2);
    doc.fontSize(20).font("Helvetica").text("Certificamos que", { align: "center" });
    
    doc.moveDown(1);
    doc.fontSize(30).font("Helvetica-Bold").fillColor("#0056b3").text(data.aluno_nome, { align: "center" });
    
    doc.moveDown(1);
    doc.fontSize(20).fillColor("#000000").font("Helvetica").text("concluiu com sucesso o treinamento da formação:", { align: "center" });
    
    doc.moveDown(1);
    doc.fontSize(25).font("Helvetica-Bold").text(data.curso_titulo, { align: "center" });
    
    doc.moveDown(3);
    doc.fontSize(12).font("Helvetica").text(`Código de Validação: ${data.validation_code}`, { align: "center" });
    
    // Finalize the PDF and end the stream
    doc.end();
}