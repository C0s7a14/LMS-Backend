import { Request, Response } from "express";

import { updateCourseStatusService } from "../services/adminCourseStatusService.js";

export async function updateCourseStatusController(req: Request, res: Response) {
  try {
    const { courseId } = req.params;
    const { status } = req.body;

    const result = await updateCourseStatusService(Number(courseId), status);

    return res.json(result);
  } catch (error: any) {
    console.log(error);

    return res.status(400).json({
      message: error.message || "Erro ao atualizar status do curso.",
    });
  }
}