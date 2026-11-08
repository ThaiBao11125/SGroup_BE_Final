import * as submissionRepository from "../repository/submission.repository.js";
import * as assignmentRepository from "../repository/assignment.repository.js";
import * as classRepository from "../repository/class.repository.js";
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from "../core/error.response.js";

export const submitAssignment = async (assignmentId, { content, repositoryUrl }, currentUser) => {
  const userId = Number(currentUser?.id);
  if (!Number.isSafeInteger(userId) || userId < 1) {
    throw new UnauthorizedError("Thông tin người dùng không hợp lệ!");
  }

  const assignmentIdNumber = Number(assignmentId);
  if (!Number.isSafeInteger(assignmentIdNumber) || assignmentIdNumber < 1) {
    throw new BadRequestError("ID bài tập không hợp lệ!");
  }

  const assignment = await assignmentRepository.findAssignmentById(assignmentIdNumber);
  if (!assignment) {
    throw new NotFoundError("Bài tập không tồn tại!");
  }

  const classIdNumber = Number(assignment.class_id);
  const classInfo = await classRepository.findClassById(classIdNumber);
  if (!classInfo) {
    throw new NotFoundError("Lớp học của bài tập không tồn tại!");
  }

  const isMember = await classRepository.isMemberInClass(classIdNumber, userId);
  if (!isMember) {
    throw new ForbiddenError("Bạn không phải học viên của lớp học này nên không thể nộp bài!");
  }

  if (new Date() > new Date(assignment.deadline)) {
    throw new BadRequestError("Đã quá hạn nộp bài tập!");
  }

  const existingSubmission = await submissionRepository.findSubmissionByAssignmentAndMember(
    assignmentIdNumber,
    userId
  );
  if (existingSubmission) {
    throw new ConflictError("Bạn đã nộp bài cho bài tập này rồi!");
  }

  return await submissionRepository.createSubmission({
    assignmentId: assignmentIdNumber,
    memberId: userId,
    content: content || null,
    repositoryUrl,
  });
};

export const getSubmissionsByAssignmentId = async (assignmentId, currentUser) => {
  const userId = Number(currentUser?.id);
  if (!Number.isSafeInteger(userId) || userId < 1) {
    throw new UnauthorizedError("Thông tin người dùng không hợp lệ!");
  }

  const assignmentIdNumber = Number(assignmentId);
  if (!Number.isSafeInteger(assignmentIdNumber) || assignmentIdNumber < 1) {
    throw new BadRequestError("ID bài tập không hợp lệ!");
  }

  const assignment = await assignmentRepository.findAssignmentById(assignmentIdNumber);
  if (!assignment) {
    throw new NotFoundError("Bài tập không tồn tại!");
  }

  const classIdNumber = Number(assignment.class_id);
  const classInfo = await classRepository.findClassById(classIdNumber);
  if (!classInfo) {
    throw new NotFoundError("Lớp học của bài tập không tồn tại!");
  }

  const isAdmin = currentUser.role === "ADMIN";
  const isMentor = Number(classInfo.mentor_id) === userId;

  if (isAdmin || isMentor) {
    return await submissionRepository.findSubmissionsByAssignmentId(assignmentIdNumber);
  }

  const isMember = await classRepository.isMemberInClass(classIdNumber, userId);
  if (!isMember) {
    throw new ForbiddenError("Bạn không có quyền truy cập danh sách bài nộp của bài tập này!");
  }

  return await submissionRepository.findSubmissionsByAssignmentId(assignmentIdNumber, userId);
};

export const getSubmissionById = async (submissionId, currentUser) => {
  const userId = Number(currentUser?.id);
  if (!Number.isSafeInteger(userId) || userId < 1) {
    throw new UnauthorizedError("Thông tin người dùng không hợp lệ!");
  }

  const submissionIdNumber = Number(submissionId);
  if (!Number.isSafeInteger(submissionIdNumber) || submissionIdNumber < 1) {
    throw new BadRequestError("ID bài nộp không hợp lệ!");
  }

  const submission = await submissionRepository.findSubmissionById(submissionIdNumber);
  if (!submission) {
    throw new NotFoundError("Bài nộp không tồn tại!");
  }

  const isAdmin = currentUser.role === "ADMIN";
  const isMentor = Number(submission.mentor_id) === userId;
  const isOwner = Number(submission.member_id) === userId;

  if (!isAdmin && !isMentor && !isOwner) {
    throw new ForbiddenError("Bạn không có quyền xem chi tiết bài nộp này!");
  }

  return submission;
};

export const reviewSubmission = async (submissionId, { score, feedback }, currentUser) => {
  const userId = Number(currentUser?.id);
  if (!Number.isSafeInteger(userId) || userId < 1) {
    throw new UnauthorizedError("Thông tin người dùng không hợp lệ!");
  }

  const submissionIdNumber = Number(submissionId);
  if (!Number.isSafeInteger(submissionIdNumber) || submissionIdNumber < 1) {
    throw new BadRequestError("ID bài nộp không hợp lệ!");
  }

  const submission = await submissionRepository.findSubmissionById(submissionIdNumber);
  if (!submission) {
    throw new NotFoundError("Bài nộp không tồn tại!");
  }

  const isAdmin = currentUser.role === "ADMIN";
  const isMentor = Number(submission.mentor_id) === userId;

  if (!isAdmin && !isMentor) {
    throw new ForbiddenError("Chỉ Mentor phụ trách lớp học này mới có quyền chấm điểm bài nộp!");
  }

  const scoreNum = Number(score);
  if (Number.isNaN(scoreNum) || scoreNum < 0 || scoreNum > Number(submission.maximum_score)) {
    throw new BadRequestError(
      `Điểm số không hợp lệ! Điểm phải từ 0 đến mức tối đa là ${submission.maximum_score}.`
    );
  }

  return await submissionRepository.reviewSubmission(submissionIdNumber, {
    score: scoreNum,
    feedback: feedback || null,
    reviewerId: userId,
  });
};
