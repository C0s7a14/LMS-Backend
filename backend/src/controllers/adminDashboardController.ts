import type { Request, Response, NextFunction } from "express";

import { getAdminDashboardService } from "../services/adminDashboardService.js";

export async function getAdminDashboardController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await getAdminDashboardService();

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}