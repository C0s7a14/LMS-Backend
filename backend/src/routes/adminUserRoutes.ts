import { Router } from "express";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

import { updateUserRoleController } from "../controllers/adminUserController.js";

const router = Router();

router.patch(
  "/admin/users/:userId/role",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateUserRoleController
);

export default router;