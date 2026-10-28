import catchAsync from "../utils/catchAsync.js";
import { sendSuccess } from "../utils/responseHelper.js";
import * as classService from "../services/class.service.js";

export const createClass = catchAsync(async (req, res) => {
  const result = await classService.createClass(req.body);
  return sendSuccess(res, 201, "Tạo lớp học thành công!", result);
});

export const getClasses = catchAsync(async (req, res) => {
  const results = await classService.getClasses(req.user);
  return sendSuccess(res, 200, "Lấy danh sách lớp học thành công!", results);
});

export const getClassById = catchAsync(async (req, res) => {
  const result = await classService.getClassById(req.params.id, req.user);
  return sendSuccess(res, 200, "Lấy thông tin lớp học thành công!", result);
});

export const updateClass = catchAsync(async (req, res) => {
  const result = await classService.updateClass(req.params.id, req.body);
  return sendSuccess(res, 200, "Cập nhật lớp học thành công!", result);
});

export const deleteClass = catchAsync(async (req, res) => {
  const result = await classService.deleteClass(req.params.id);
  return sendSuccess(res, 200, "Xóa lớp học thành công!", result);
});

export const addMember = catchAsync(async (req, res) => {
  const result = await classService.addMember(req.params.id, req.body.memberId);
  return sendSuccess(res, 201, "Thêm học viên vào lớp thành công!", result);
});

export const getMembers = catchAsync(async (req, res) => {
  const results = await classService.getMembers(req.params.id, req.user);
  return sendSuccess(res, 200, "Lấy danh sách học viên thành công!", results);
});

export const removeMember = catchAsync(async (req, res) => {
  const result = await classService.removeMember(req.params.id, req.params.memberId);
  return sendSuccess(res, 200, "Xóa học viên khỏi lớp thành công!", result);
});
