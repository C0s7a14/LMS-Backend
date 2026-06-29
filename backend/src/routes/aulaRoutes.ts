import { Router } from "express";

import {
  createAulaController,
  getAulasByModuloController,
  getAulaByIdController,
  updateAulaController,
  deleteAulaController,
  completeAulaController,
} from "../controllers/aulaController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = Router();

/* AULAS POR MÓDULO */

router.post(
  "/modulos/:moduloId/aulas",
  authMiddleware,
  roleMiddleware(["admin"]),
  createAulaController
);

router.get(
  "/modulos/:moduloId/aulas",
  authMiddleware,
  roleMiddleware(["student", "client", "admin"]),
  getAulasByModuloController
);

/* AULA ESPECÍFICA */

router.get(
  "/aulas/:id",
  authMiddleware,
  roleMiddleware(["student", "client", "admin"]),
  getAulaByIdController
);

router.put(
  "/aulas/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateAulaController
);

router.delete(
  "/aulas/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  deleteAulaController
);

/* PROGRESSO DA AULA */

router.post(
  "/aulas/:id/complete",
  authMiddleware,
  roleMiddleware(["student", "client", "admin"]),
  completeAulaController
);

export default router;