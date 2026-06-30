import { Router } from "express";

import {
  createCourseController,
  getCourseByIdController,
  getCoursesController,
  deleteCourseController,
  updateCourseController,
} from "../controllers/courseController.js";

import { getCourseContentController } from "../controllers/courseContentController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = Router();

/* CURSOS */

/* Aluno e admin podem visualizar cursos */
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["student", "admin"]),
  getCoursesController
);

/* Conteúdo completo do curso */
router.get(
  "/:courseId/content",
  authMiddleware,
  roleMiddleware(["student", "admin"]),
  getCourseContentController
);


/* Aluno e admin podem visualizar um curso específico */
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["student", "admin"]),
  getCourseByIdController
);

/* Apenas admin pode criar curso */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  createCourseController
);

/* Apenas admin pode atualizar curso */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateCourseController
);

/* Apenas admin pode deletar curso */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  deleteCourseController
);


export default router;