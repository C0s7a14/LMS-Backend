import { Router } from "express";
import { 
    createCertificate, 
    getAllCertificates, 
    getCertificateById, 
    updateCertificate, 
    deleteCertificate,
    downloadCertificate
} from "../controllers/certificateController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// Create (POST)
router.post("/", authMiddleware, createCertificate);

// Read All (GET)
router.get("/", authMiddleware, getAllCertificates);

// Read One by ID (GET)
router.get("/:id", authMiddleware, getCertificateById);

// Download (GET)
router.get("/:id/download", authMiddleware, downloadCertificate);

// Update by ID (PUT)
router.put("/:id", authMiddleware, updateCertificate);

// Delete by ID (DELETE)
router.delete("/:id", authMiddleware, deleteCertificate);

export default router;