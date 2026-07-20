import { Request, Response } from "express";

import { updateUserRoleService } from "../services/adminUserService.js";

export async function updateUserRoleController(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const authenticatedUserId = req.user?.id;

    const result = await updateUserRoleService(
      Number(userId),
      role,
      authenticatedUserId
    );

    return res.json(result);
  } catch (error: any) {
    console.log(error);

    return res.status(400).json({
      message: error.message || "Erro ao atualizar role do usuário.",
    });
  }
}