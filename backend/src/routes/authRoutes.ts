import { Router } from "express";
import { registerController, loginController, refreshController, logoutController } from "../controllers/authController.js";
import { forgotPassword } from "../controllers/forgotPasswordController.js";
import { resetPassword } from "../controllers/resetPasswordController.js";



const router = Router();


router.post("/register", registerController);
router.post("/login", loginController);


router.post("/refresh", refreshController);
router.post("/logout", logoutController);



router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword)
export default router;