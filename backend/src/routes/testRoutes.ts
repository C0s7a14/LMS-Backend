import { Router } from "express";

import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.get(
  "/profile",
  authMiddleware,
  (req, res) => {

    return res.json({
      message: "Rota protegida",
      user: req.user,
    });

  }
);

export default router;