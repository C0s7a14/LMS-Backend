import { Router } from "express";

import {
  createModuloController,
  getModulosByCourseController,
  getModuloByIdController,
  updateModuloController,
  deleteModuloController,
} from "../controllers/moduloController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = Router();

/* MÓDULOS POR CURSO */

router.post(
  "/courses/:courseId/modules",
  authMiddleware,
  roleMiddleware(["admin"]),
  createModuloController
);

router.get(
  "/courses/:courseId/modules",
  authMiddleware,
  roleMiddleware(["student", "admin"]),
  getModulosByCourseController
);

/* MÓDULO ESPECÍFICO */

router.get(
  "/modules/:id",
  authMiddleware,
  roleMiddleware(["student", "admin"]),
  getModuloByIdController
);

router.put(
  "/modules/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateModuloController
);

router.delete(
  "/modules/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  deleteModuloController
);

export default router;