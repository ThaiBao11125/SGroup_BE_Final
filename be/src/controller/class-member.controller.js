import catchAsync from "../utils/catchAsync.js";
import { sendSuccess } from "../utils/responseHelper.js";
import * as classMemberService from "../services/class-member.service.js";

export const addMember = catchAsync(async (req, res) => {
  const result = await classMemberService.addMember(req.params.id, req.body.memberId);
  return sendSuccess(res, 201, "Thêm học viên vào lớp thành công!", result);
});

export const getMembers = catchAsync(async (req, res) => {
  const results = await classMemberService.getMembers(req.params.id, req.user);
  return sendSuccess(res, 200, "Lấy danh sách học viên thành công!", results);
});

export const updateStatus = catchAsync(async (req, res) => {
  const result = await classMemberService.updateStatus(req.params.id, req.params.memberId, req.body.status);
  return sendSuccess(res, 200, "Cập nhật trạng thái học viên thành công!", result);
});

export const removeMember = catchAsync(async (req, res) => {
  const result = await classMemberService.removeMember(req.params.id, req.params.memberId);
  return sendSuccess(res, 200, "Xóa học viên khỏi lớp thành công!", result);
});