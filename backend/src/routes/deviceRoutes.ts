import { Router } from "express";
import { createDeviceController, getDevicesController } from "../controllers/deviceController.js";

const router = Router();

// POST http://localhost:3333/devices
router.post("/", createDeviceController);

// GET http://localhost:3333/devices
router.get("/", getDevicesController);

export default router;