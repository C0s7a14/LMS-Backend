import { Router } from "express";
import { getAdminReportsController } from "../controllers/adminReportController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = Router();

router.get(
  "/admin/reports",
  authMiddleware,
  roleMiddleware(["admin"]),
  getAdminReportsController
);

export default router;