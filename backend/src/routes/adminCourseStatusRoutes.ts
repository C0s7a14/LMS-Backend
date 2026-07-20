import { Router } from "express";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

import { updateCourseStatusController } from "../controllers/adminCourseStatusController.js";

const router = Router();

router.patch(
  "/admin/courses/:courseId/status",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateCourseStatusController
);

export default router;