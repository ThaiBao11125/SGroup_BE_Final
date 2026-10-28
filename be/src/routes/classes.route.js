import { Router } from "express";
import * as classController from "../controller/class.controller.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";
import { validate, createClassRules, updateClassRules, addMemberRules } from "../middleware/validate.js";

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

export default router;
