import { Router } from "express";
import * as lessonController from "../controller/lesson.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { validate, updateLessonRules } from "../middleware/validate.js";

const router = Router();

router.use(authenticateToken);

router.get("/:id", lessonController.getLessonById);
router.patch("/:id", validate(updateLessonRules), lessonController.updateLesson);
router.delete("/:id", lessonController.deleteLesson);
router.post("/:id/complete", lessonController.completeLesson);

export default router;
