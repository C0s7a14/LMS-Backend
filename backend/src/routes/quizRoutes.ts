import { Router } from "express";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

import {
  createQuizController,
  getQuizByIdController,
  listCourseQuizzesController,
  submitQuizController,
} from "../controllers/quizController.js";

const router = Router();

router.post(
  "/quizzes",
  authMiddleware,
  roleMiddleware(["admin"]),
  createQuizController
);

router.get(
  "/quizzes/:quizId",
  authMiddleware,
  roleMiddleware(["student", "admin"]),
  getQuizByIdController
);

router.get(
  "/courses/:courseId/quizzes",
  authMiddleware,
  roleMiddleware(["student", "admin"]),
  listCourseQuizzesController
);

router.post(
  "/quizzes/:quizId/submit",
  authMiddleware,
  roleMiddleware(["student", "admin"]),
  submitQuizController
);

export default router;