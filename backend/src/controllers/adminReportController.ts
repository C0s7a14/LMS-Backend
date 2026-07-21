import { Request, Response } from "express";
import { getAdminReportsService } from "../services/adminReportService.js";

export async function getAdminReportsController(req: Request, res: Response) {
  try {
    const reports = await getAdminReportsService();

    return res.status(200).json(reports);
  } catch (error: any) {
    console.log(error);

    return res.status(500).json({
      error: error.message || "Erro ao carregar relatórios administrativos.",
    });
  }
}