import catchAsync from "../utils/catchAsync.js";
import { sendSuccess } from "../utils/responseHelper.js";
import * as assignmentService from "../services/assignment.service.js";

export const createAssignment = catchAsync(async (req, res) => {
  const result = await assignmentService.createAssignment(req.params.id, req.body, req.user);
  return sendSuccess(res, 201, "Tạo bài tập thành công!", result);
});

export const getAssignmentsByClassId = catchAsync(async (req, res) => {
  const result = await assignmentService.getAssignmentsByClassId(req.params.id, req.user);
  return sendSuccess(res, 200, "Lấy danh sách bài tập thành công!", result);
});

export const getAssignmentById = catchAsync(async (req, res) => {
  const result = await assignmentService.getAssignmentById(req.params.id, req.user);
  return sendSuccess(res, 200, "Lấy chi tiết bài tập thành công!", result);
});

export const updateAssignment = catchAsync(async (req, res) => {
  const result = await assignmentService.updateAssignment(req.params.id, req.body, req.user);
  return sendSuccess(res, 200, "Cập nhật bài tập thành công!", result);
});

export const deleteAssignment = catchAsync(async (req, res) => {
  const result = await assignmentService.deleteAssignment(req.params.id, req.user);
  return sendSuccess(res, 200, "Xóa bài tập thành công!", result);
});