import { Router } from "express";
import * as classMemberController from "../controller/class-member.controller.js";
import { authorizeRoles } from "../middleware/auth.middleware.js";
import { validate, addMemberRules, updateMemberStatusRules } from "../middleware/validate.js"; 

const router = Router({ mergeParams: true }); 

router.get("/", classMemberController.getMembers);
router.post("/", authorizeRoles("ADMIN"), validate(addMemberRules), classMemberController.addMember);
router.patch("/:memberId/status", authorizeRoles("ADMIN"), validate(updateMemberStatusRules), classMemberController.updateStatus);
router.delete("/:memberId", authorizeRoles("ADMIN"), classMemberController.removeMember);

export default router;