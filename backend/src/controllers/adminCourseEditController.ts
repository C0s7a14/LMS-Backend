import { Request, Response } from "express";

import { updateAdminCourseService } from "../services/adminCourseEditService.js";

export async function updateAdminCourseController(req: Request, res: Response) {
  try {
    const { courseId } = req.params;
    const { titulo, descricao, thumbnail } = req.body;

    const result = await updateAdminCourseService(Number(courseId), {
      titulo,
      descricao,
      thumbnail,
    });

    return res.json(result);
  } catch (error: any) {
    console.log(error);

    return res.status(400).json({
      message: error.message || "Erro ao atualizar curso.",
    });
  }
}