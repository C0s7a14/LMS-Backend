import { Router } from "express";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

import {
  getClientDevicesController,
  linkDeviceToClientController,
  unlinkDeviceFromClientController,
  getAdminClientDevicesController,
} from "../controllers/clientDeviceController.js";

const router = Router();

router.get(
  "/client/devices",
  authMiddleware,
  roleMiddleware(["client", "admin"]),
  getClientDevicesController
);

router.get(
  "/admin/clients/:clientId/devices",
  authMiddleware,
  roleMiddleware(["admin"]),
  getAdminClientDevicesController
);

router.post(
  "/admin/clients/:clientId/devices/:deviceId",
  authMiddleware,
  roleMiddleware(["admin"]),
  linkDeviceToClientController
);

router.delete(
  "/admin/clients/:clientId/devices/:deviceId",
  authMiddleware,
  roleMiddleware(["admin"]),
  unlinkDeviceFromClientController
);

export default router;