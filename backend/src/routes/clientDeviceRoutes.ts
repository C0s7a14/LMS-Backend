import { Router } from "express";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

import {
  getClientDevicesController,
  linkDeviceToClientController,
  unlinkDeviceFromClientController,
  getAdminClientDevicesController,
  downloadClientDeviceDocumentController,
  getClientDeviceDetailsController,
  listClientDeviceDocumentsController
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

router.get(
  "/client/devices/:deviceId",
  authMiddleware,
  roleMiddleware(["client"]),
  getClientDeviceDetailsController
);

router.get(
  "/client/devices/:deviceId/documents",
  authMiddleware,
  roleMiddleware(["client"]),
  listClientDeviceDocumentsController
);

router.get(
  "/client/device-documents/:documentId/download",
  authMiddleware,
  roleMiddleware(["client"]),
  downloadClientDeviceDocumentController
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