import { Router } from "express";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

import {
  generateLessonQuizWithAiController,
  generateModuleQuizWithAiController,
  generateFinalExamWithAiController,
} from "../controllers/aiQuizController.js";

const router = Router();

router.post(
  "/aulas/:aulaId/ai/generate-quiz",
  authMiddleware,
  roleMiddleware(["admin"]),
  generateLessonQuizWithAiController
);

router.post(
  "/modulos/:moduloId/ai/generate-quiz",
  authMiddleware,
  roleMiddleware(["admin"]),
  generateModuleQuizWithAiController
);

router.post(
  "/courses/:courseId/ai/generate-final-exam",
  authMiddleware,
  roleMiddleware(["admin"]),
  generateFinalExamWithAiController
);

export default router;