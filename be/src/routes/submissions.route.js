import { Router } from "express";
import * as submissionController from "../controller/submission.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { validate, submissionIdParamRules, reviewSubmissionRules } from "../middleware/validate.js";

const router = Router();

router.use(authenticateToken);

router.get("/:id", validate(submissionIdParamRules), submissionController.getSubmissionById);
router.patch("/:id/review", validate(reviewSubmissionRules), submissionController.reviewSubmission);

export default router;
