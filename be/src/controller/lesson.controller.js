import catchAsync from "../utils/catchAsync.js";
import { sendSuccess } from "../utils/responseHelper.js";
import * as lessonService from "../services/lesson.service.js";

export const createLesson = catchAsync(async (req, res) => {
  const result = await lessonService.createLesson(req.params.id, req.body, req.user);
  return sendSuccess(res, 201, "Tạo bài học thành công!", result);
});

export const getLessonsByClassId = catchAsync(async (req, res) => {
  const results = await lessonService.getLessonsByClassId(req.params.id, req.user);
  return sendSuccess(res, 200, "Lấy danh sách bài học thành công!", results);
});

export const getLessonById = catchAsync(async (req, res) => {
  const result = await lessonService.getLessonById(req.params.id, req.user);
  return sendSuccess(res, 200, "Lấy thông tin bài học thành công!", result);
});

export const updateLesson = catchAsync(async (req, res) => {
  const result = await lessonService.updateLesson(req.params.id, req.body, req.user);
  return sendSuccess(res, 200, "Cập nhật bài học thành công!", result);
});

export const deleteLesson = catchAsync(async (req, res) => {
  const result = await lessonService.deleteLesson(req.params.id, req.user);
  return sendSuccess(res, 200, "Xóa bài học thành công!", result);
});

export const completeLesson = catchAsync(async (req, res) => {
  const result = await lessonService.completeLesson(req.params.id, req.user);
  return sendSuccess(res, 200, "Đánh dấu hoàn thành bài học thành công!", result);
});

export const getClassProgress = catchAsync(async (req, res) => {
  const result = await lessonService.getClassProgress(req.params.id, req.user, req.query.memberId);
  return sendSuccess(res, 200, "Lấy tiến độ học tập thành công!", result);
});
