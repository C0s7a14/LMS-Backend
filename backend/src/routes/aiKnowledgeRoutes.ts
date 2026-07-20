import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

import {
  createAiPromptController,
  createDeviceDocumentController,
  deleteDeviceDocumentController,
  getAiKnowledgeSummaryController,
  getAiPromptsController,
  getDeviceDocumentsController,
  processDeviceDocumentController,
  updateAiPromptController,
  getAiDevicesController,
} from "../controllers/aiKnowledgeController.js";

const uploadDir = path.resolve("uploads/ai-documents");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9.-]/g, "-");

    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Apenas arquivos PDF são permitidos."));
      return;
    }

    cb(null, true);
  },
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

const router = Router();

router.get(
  "/admin/ai/summary",
  authMiddleware,
  roleMiddleware(["admin"]),
  getAiKnowledgeSummaryController
);

router.get(
  "/admin/ai/devices",
  authMiddleware,
  roleMiddleware(["admin"]),
  getAiDevicesController
);

router.get(
  "/admin/ai/prompts",
  authMiddleware,
  roleMiddleware(["admin"]),
  getAiPromptsController
);

router.post(
  "/admin/ai/prompts",
  authMiddleware,
  roleMiddleware(["admin"]),
  createAiPromptController
);

router.patch(
  "/admin/ai/prompts/:promptId",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateAiPromptController
);

router.get(
  "/admin/devices/:deviceId/documents",
  authMiddleware,
  roleMiddleware(["admin"]),
  getDeviceDocumentsController
);



router.post(
  "/admin/devices/:deviceId/documents",
  authMiddleware,
  roleMiddleware(["admin"]),
  upload.single("file"),
  createDeviceDocumentController
);

router.post(
  "/admin/device-documents/:documentId/process",
  authMiddleware,
  roleMiddleware(["admin"]),
  processDeviceDocumentController
);

router.delete(
  "/admin/device-documents/:documentId",
  authMiddleware,
  roleMiddleware(["admin"]),
  deleteDeviceDocumentController
);

export default router;