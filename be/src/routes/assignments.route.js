import { Router } from "express";
import * as assignmentController from "../controller/assignment.controller.js";
import * as submissionController from "../controller/submission.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import {
  validate,
  assignmentIdParamRules,
  updateAssignmentRules,
  createSubmissionRules,
} from "../middleware/validate.js";

const router = Router();

router.use(authenticateToken);

router.get("/:id", validate(assignmentIdParamRules), assignmentController.getAssignmentById);
router.patch("/:id", validate(updateAssignmentRules), assignmentController.updateAssignment);
router.delete("/:id", validate(assignmentIdParamRules), assignmentController.deleteAssignment);

router.post("/:id/submissions", validate(createSubmissionRules), submissionController.submitAssignment);
router.get("/:id/submissions", validate(assignmentIdParamRules), submissionController.getSubmissionsByAssignmentId);

export default router;