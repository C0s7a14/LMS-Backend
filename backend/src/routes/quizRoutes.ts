import { Router } from "express";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

import {
  createQuizController,
  getQuizByIdController,
  listCourseQuizzesController,
  submitQuizController,
  startQuizAttemptController,
  updateQuizController,
  deleteQuizController,
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

router.post(
  "/quizzes/:quizId/start",
  authMiddleware,
  roleMiddleware(["student", "admin"]),
  startQuizAttemptController
);

router.put(
  "/quizzes/:quizId",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateQuizController
);

router.delete(
  "/quizzes/:quizId",
  authMiddleware,
  roleMiddleware(["admin"]),
  deleteQuizController
);

export default router;