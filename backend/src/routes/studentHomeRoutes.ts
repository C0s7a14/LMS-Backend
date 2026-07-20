import { Router } from "express";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { getStudentHomeController } from "../controllers/studentHomeController.js";

const router = Router();

router.get(
  "/student/home",
  authMiddleware,
  roleMiddleware(["student", "admin"]), //após mvp deixar só para student(aluno)
  getStudentHomeController
);

export default router;