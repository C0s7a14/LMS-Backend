import { Router } from "express";

import {
  createDeviceController,
  getDevicesController,
  getDeviceByIdController,
  updateDeviceController,
  deleteDeviceController,
  attachDeviceToCourseController,
  getDevicesByCourseController,
  detachDeviceFromCourseController
} from "../controllers/deviceController.js";

const router = Router();

/* CRUD DISPOSITIVOS */

router.post(
  "/",
  createDeviceController
);

router.get(
  "/",
  getDevicesController
);

router.get(
  "/:id",
  getDeviceByIdController
);

router.put(
  "/:id",
  updateDeviceController
);

router.delete(
  "/:id",
  deleteDeviceController
);

/* ASSOCIAÇÃO COM CURSOS */

router.post(
  "/courses/:courseId/devices/:deviceId",
  attachDeviceToCourseController
);

router.get(
  "/courses/:courseId/devices",
  getDevicesByCourseController
);

router.delete(
  "/courses/:courseId/devices/:deviceId",
  detachDeviceFromCourseController
);

export default router;