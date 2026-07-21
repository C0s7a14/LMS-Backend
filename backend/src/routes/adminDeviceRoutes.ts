import { Router } from "express";
import {
  deleteAdminDeviceController,
  updateAdminDeviceController,
} from "../controllers/adminDeviceController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = Router();

router.patch(
  "/admin/devices/:deviceId",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateAdminDeviceController
);

router.delete(
  "/admin/devices/:deviceId",
  authMiddleware,
  roleMiddleware(["admin"]),
  deleteAdminDeviceController
);

export default router;