import { Router } from "express";
import * as assignmentController from "../controller/assignment.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { validate, assignmentIdParamRules, updateAssignmentRules } from "../middleware/validate.js";

const router = Router();

router.use(authenticateToken);

router.get("/:id", validate(assignmentIdParamRules), assignmentController.getAssignmentById);
router.patch("/:id", validate(updateAssignmentRules), assignmentController.updateAssignment);
router.delete("/:id", validate(assignmentIdParamRules), assignmentController.deleteAssignment);

export default router;