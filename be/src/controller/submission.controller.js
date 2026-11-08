import catchAsync from "../utils/catchAsync.js";
import { sendSuccess } from "../utils/responseHelper.js";
import * as submissionService from "../services/submission.service.js";

export const submitAssignment = catchAsync(async (req, res) => {
  const result = await submissionService.submitAssignment(req.params.id, req.body, req.user);
  return sendSuccess(res, 201, "Nộp bài tập thành công!", result);
});

export const getSubmissionsByAssignmentId = catchAsync(async (req, res) => {
  const results = await submissionService.getSubmissionsByAssignmentId(req.params.id, req.user);
  return sendSuccess(res, 200, "Lấy danh sách bài nộp thành công!", results);
});

export const getSubmissionById = catchAsync(async (req, res) => {
  const result = await submissionService.getSubmissionById(req.params.id, req.user);
  return sendSuccess(res, 200, "Lấy chi tiết bài nộp thành công!", result);
});

export const reviewSubmission = catchAsync(async (req, res) => {
  const result = await submissionService.reviewSubmission(req.params.id, req.body, req.user);
  return sendSuccess(res, 200, "Chấm điểm bài nộp thành công!", result);
});
