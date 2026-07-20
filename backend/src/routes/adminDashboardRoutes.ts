import { Router } from "express";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

import { getAdminDashboardController } from "../controllers/adminDashboardController.js";

const router = Router();

router.get(
  "/admin/dashboard",
  authMiddleware,
  roleMiddleware(["admin"]),
  getAdminDashboardController
);

export default router;