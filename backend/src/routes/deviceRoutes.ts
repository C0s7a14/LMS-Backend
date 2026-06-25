import { Router } from "express";

import {
  createDeviceController,
  getDevicesController,
  getDeviceByIdController,
  updateDeviceController,
  deleteDeviceController,
  attachDeviceToCourseController,
  getDevicesByCourseController,
  detachDeviceFromCourseController,
} from "../controllers/deviceController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = Router();

/* CRUD DISPOSITIVOS */

/* Aluno e admin podem visualizar dispositivos */
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["student", "admin"]),
  getDevicesController
);

/* Aluno e admin podem visualizar um dispositivo específico */
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["student", "admin"]),
  getDeviceByIdController
);

/* Apenas admin pode criar dispositivo */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  createDeviceController
);

/* Apenas admin pode atualizar dispositivo */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateDeviceController
);

/* Apenas admin pode deletar dispositivo */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  deleteDeviceController
);

/* ASSOCIAÇÃO COM CURSOS */

/* Apenas admin pode associar dispositivo a curso */
router.post(
  "/courses/:courseId/devices/:deviceId",
  authMiddleware,
  roleMiddleware(["admin"]),
  attachDeviceToCourseController
);

/* Aluno e admin podem ver dispositivos associados a um curso */
router.get(
  "/courses/:courseId/devices",
  authMiddleware,
  roleMiddleware(["student", "admin"]),
  getDevicesByCourseController
);

/* Apenas admin pode remover associação */
router.delete(
  "/courses/:courseId/devices/:deviceId",
  authMiddleware,
  roleMiddleware(["admin"]),
  detachDeviceFromCourseController
);

export default router;