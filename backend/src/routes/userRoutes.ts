import { Router } from "express";

import {
  getUsersController,
  getUserByIdController,
  updateUserController,
  deleteUserController,
} from "../controllers/userController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = Router();

router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  getUsersController
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  getUserByIdController
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateUserController
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  deleteUserController
);

export default router;