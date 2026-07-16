import { Router } from "express";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

import {
  completeCourseReviewController,
  getCourseReviewStatusController,
} from "../controllers/courseReviewController.js";

const router = Router();

router.get(
  "/courses/:courseId/review/status",
  authMiddleware,
  roleMiddleware(["student", "admin"]),
  getCourseReviewStatusController
);

router.post(
  "/courses/:courseId/review/complete",
  authMiddleware,
  roleMiddleware(["student", "admin"]),
  completeCourseReviewController
);

export default router;