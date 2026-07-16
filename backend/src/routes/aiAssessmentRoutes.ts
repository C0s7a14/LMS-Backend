import { Router } from "express";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { generateCourseAssessmentsWithAiController } from "../controllers/aiAssessmentController.js";

const router = Router();

router.post(
  "/courses/:courseId/ai/generate-assessments",
  authMiddleware,
  roleMiddleware(["admin"]),
  generateCourseAssessmentsWithAiController
);

export default router;