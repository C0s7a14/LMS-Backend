import { Router } from "express";

import {
  getUsersController,
  getUserByIdController,
  updateUserController,
  deleteUserController
} from "../controllers/userController.js";

const router = Router();

router.get(
  "/",
  getUsersController
);

router.get(
  "/:id",
  getUserByIdController
);

router.put(
  "/:id",
  updateUserController
);

router.delete(
  "/:id",
  deleteUserController
);

export default router;