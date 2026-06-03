import { Router } from "express";
import { createCourseController, getCourseByIdController, getCoursesController, deleteCourseController, updateCourseController } from "../controllers/courseController.js";
const router = Router();

router.post("/", createCourseController);


router.get("/", getCoursesController);
router.get("/:id", getCourseByIdController);


router.delete("/:id", deleteCourseController);


router.put("/:id", updateCourseController);

export default router;