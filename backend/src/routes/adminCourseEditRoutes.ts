import { Router } from "express";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

import { updateAdminCourseController } from "../controllers/adminCourseEditController.js";

const router = Router();

router.patch(
  "/admin/courses/:courseId",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateAdminCourseController
);

export default router;