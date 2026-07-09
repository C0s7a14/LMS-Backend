import { Router } from "express";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { uploadPdf } from "../config/uploadPdf.js";

import {
  extractPdfFromCourseController,
  generateCourseFromPdfController,
  applyGeneratedCourseController,
} from "../controllers/aiCourseController.js";
const router = Router();

router.post(
  "/courses/:courseId/ai/extract-pdf",
  authMiddleware,
  roleMiddleware(["admin"]),
  uploadPdf.any(),
  extractPdfFromCourseController
);

router.post(
  "/courses/:courseId/ai/generate-from-pdf",
  authMiddleware,
  roleMiddleware(["admin"]),
  uploadPdf.any(),
  generateCourseFromPdfController
);

router.post(
  "/courses/:courseId/ai/apply-generated-course",
  authMiddleware,
  roleMiddleware(["admin"]),
  applyGeneratedCourseController
);

export default router;