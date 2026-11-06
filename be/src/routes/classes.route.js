import { Router } from "express";
import * as classController from "../controller/class.controller.js";
import * as lessonController from "../controller/lesson.controller.js";
import * as assignmentController from "../controller/assignment.controller.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";
import {
  validate,
  createClassRules,
  updateClassRules,
  addMemberRules,
  createLessonRules,
  createAssignmentRules,
  classIdParamRules,
} from "../middleware/validate.js";

const router = Router();

router.use(authenticateToken);

router.get("/", classController.getClasses);
router.get("/:id", classController.getClassById);
router.post("/", authorizeRoles("ADMIN"), validate(createClassRules), classController.createClass);
router.patch("/:id", authorizeRoles("ADMIN"), validate(updateClassRules), classController.updateClass);
router.delete("/:id", authorizeRoles("ADMIN"), classController.deleteClass);

router.get("/:id/members", classController.getMembers);
router.post("/:id/members", authorizeRoles("ADMIN"), validate(addMemberRules), classController.addMember);
router.delete("/:id/members/:memberId", authorizeRoles("ADMIN"), classController.removeMember);

router.get("/:id/lessons", lessonController.getLessonsByClassId);
router.post("/:id/lessons", validate(createLessonRules), lessonController.createLesson);
router.get("/:id/progress", lessonController.getClassProgress);

router.post("/:id/assignments", validate(createAssignmentRules), assignmentController.createAssignment);
router.get("/:id/assignments", validate(classIdParamRules), assignmentController.getAssignmentsByClassId);

export default router;
