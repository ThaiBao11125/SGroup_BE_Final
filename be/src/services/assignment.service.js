import * as assignmentRepository from "../repository/assignment.repository.js";
import * as classRepository from "../repository/class.repository.js";
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError } from "../core/error.response.js";

export const createAssignment = async (classId, { title, description, deadline, maximumScore }, currentUser) => {
  const userId = Number(currentUser?.id);
  if (!Number.isSafeInteger(userId) || userId < 1) {
    throw new UnauthorizedError("Thông tin người dùng không hợp lệ!");
  }

  if (currentUser.role !== "MEMBER") {
    throw new ForbiddenError("ADMIN không có quyền thực hiện thao tác này!");
  }

  const classIdNumber = Number(classId);
  if (!Number.isSafeInteger(classIdNumber) || classIdNumber < 1) {
    throw new BadRequestError("ID lớp học không hợp lệ!");
  }

  const classInfo = await classRepository.findClassById(classIdNumber);
  if (!classInfo) {
    throw new NotFoundError("Lớp học không tồn tại!");
  }

  const isMentor = Number(classInfo.mentor_id) === userId;
  if (!isMentor) {
    throw new ForbiddenError("Chỉ Mentor phụ trách lớp học này mới có quyền tạo bài tập!");
  }

  return await assignmentRepository.createAssignment({
    classId: classIdNumber,
    title,
    description: description || null,
    deadline,
    maximumScore: maximumScore ?? null,
    createdBy: userId,
  });
};

export const getAssignmentsByClassId = async (classId, currentUser) => {
  const userId = Number(currentUser?.id);
  if (!Number.isSafeInteger(userId) || userId < 1) {
    throw new UnauthorizedError("Thông tin người dùng không hợp lệ!");
  }

  const classIdNumber = Number(classId);
  if (!Number.isSafeInteger(classIdNumber) || classIdNumber < 1) {
    throw new BadRequestError("ID lớp học không hợp lệ!");
  }

  const classInfo = await classRepository.findClassById(classIdNumber);
  if (!classInfo) {
    throw new NotFoundError("Lớp học không tồn tại!");
  }

  const isAdmin = currentUser.role === "ADMIN";
  const isMentor = Number(classInfo.mentor_id) === userId;

  if (!isAdmin && !isMentor) {
    const isMember = await classRepository.isMemberInClass(classIdNumber, userId);
    if (!isMember) {
      throw new ForbiddenError("Bạn không có quyền xem danh sách bài tập của lớp này!");
    }
  }

  return await assignmentRepository.findAssignmentsByClassId(classIdNumber);
};

export const getAssignmentById = async (assignmentId, currentUser) => {
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
    throw new NotFoundError("Bài tập không tồn tại!");
  }

  const isAdmin = currentUser.role === "ADMIN";
  const isMentor = Number(classInfo.mentor_id) === userId;

  if (!isAdmin && !isMentor) {
    const isMember = await classRepository.isMemberInClass(classIdNumber, userId);
    if (!isMember) {
      throw new ForbiddenError("Bạn không có quyền xem bài tập này!");
    }
  }

  return assignment;
};

const ALLOWED_UPDATE_FIELDS = ["title", "description", "deadline", "maximumScore"];

export const updateAssignment = async (assignmentId, body, currentUser) => {
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

  const classInfo = await classRepository.findClassById(Number(assignment.class_id));
  if (!classInfo) {
    throw new NotFoundError("Bài tập không tồn tại!");
  }

  const isMentor = currentUser.role === "MEMBER" && Number(classInfo.mentor_id) === userId;
  if (!isMentor) {
    throw new ForbiddenError("Chỉ Mentor phụ trách lớp học này mới có quyền cập nhật bài tập!");
  }

  const fields = {};
  for (const key of ALLOWED_UPDATE_FIELDS) {
    if (body && Object.hasOwn(body, key) && body[key] !== undefined) {
      fields[key] = body[key];
    }
  }
  if (Object.keys(fields).length === 0) {
    throw new BadRequestError("Không có trường nào để cập nhật!");
  }
  if ("description" in fields) {
    fields.description = fields.description || null;
  }

  const result = await assignmentRepository.updateAssignmentById(assignmentIdNumber, fields);
  if (!result) {
    throw new NotFoundError("Bài tập không tồn tại!");
  }
  return result;
};

export const deleteAssignment = async (assignmentId, currentUser) => {
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

  const classInfo = await classRepository.findClassById(Number(assignment.class_id));
  if (!classInfo) {
    throw new NotFoundError("Bài tập không tồn tại!");
  }

  const isMentor = currentUser.role === "MEMBER" && Number(classInfo.mentor_id) === userId;
  if (!isMentor) {
    throw new ForbiddenError("Chỉ Mentor phụ trách lớp học này mới có quyền xóa bài tập!");
  }

  const result = await assignmentRepository.deleteAssignmentById(assignmentIdNumber);

  if (result.status === "NOT_FOUND") {
    throw new NotFoundError("Bài tập không tồn tại!");
  }

  if (result.status === "HAS_SUBMISSIONS") {
    throw new ConflictError("Không thể xóa bài tập đã có bài nộp!");
  }

  return result.assignment;
};