import * as lessonRepository from "../repository/lesson.repository.js";
import * as classRepository from "../repository/class.repository.js";
import { NotFoundError, ForbiddenError, BadRequestError } from "../core/error.response.js";

export const createLesson = async (classId, { title, content, order }, currentUser) => {
  const classInfo = await classRepository.findClassById(classId);
  if (!classInfo) {
    throw new NotFoundError("Lớp học không tồn tại!");
  }

  const isMentor = parseInt(classInfo.mentor_id, 10) === parseInt(currentUser.id, 10);
  const isAdmin = currentUser.role === "ADMIN";

  if (!isMentor && !isAdmin) {
    throw new ForbiddenError("Chỉ Mentor phụ trách lớp học này hoặc Admin mới có quyền tạo bài học!");
  }

  let finalOrder = order;
  if (!finalOrder) {
    const maxOrder = await lessonRepository.getMaxLessonOrder(classId);
    finalOrder = maxOrder + 1;
  }

  return await lessonRepository.createLesson({
    classId,
    title,
    content: content || null,
    order: finalOrder,
    createdBy: currentUser.id,
  });
};

export const getLessonsByClassId = async (classId, currentUser) => {
  const classInfo = await classRepository.findClassById(classId);
  if (!classInfo) {
    throw new NotFoundError("Lớp học không tồn tại!");
  }

  const isMentor = parseInt(classInfo.mentor_id, 10) === parseInt(currentUser.id, 10);
  const isAdmin = currentUser.role === "ADMIN";
  const isMember = await classRepository.isMemberInClass(classId, currentUser.id);

  if (!isMentor && !isAdmin && !isMember) {
    throw new ForbiddenError("Bạn không có quyền truy cập danh sách bài học của lớp này!");
  }

  return await lessonRepository.findLessonsByClassId(classId, isMember ? currentUser.id : null);
};

export const getLessonById = async (lessonId, currentUser) => {
  const lesson = await lessonRepository.findLessonById(lessonId);
  if (!lesson) {
    throw new NotFoundError("Bài học không tồn tại!");
  }

  const isMentor = parseInt(lesson.mentor_id, 10) === parseInt(currentUser.id, 10);
  const isAdmin = currentUser.role === "ADMIN";
  const isMember = await classRepository.isMemberInClass(lesson.class_id, currentUser.id);

  if (!isMentor && !isAdmin && !isMember) {
    throw new ForbiddenError("Bạn không có quyền xem thông tin bài học này!");
  }

  return lesson;
};

export const updateLesson = async (lessonId, updateData, currentUser) => {
  const lesson = await lessonRepository.findLessonById(lessonId);
  if (!lesson) {
    throw new NotFoundError("Bài học không tồn tại!");
  }

  const isMentor = parseInt(lesson.mentor_id, 10) === parseInt(currentUser.id, 10);
  const isAdmin = currentUser.role === "ADMIN";

  if (!isMentor && !isAdmin) {
    throw new ForbiddenError("Chỉ Mentor phụ trách lớp học này hoặc Admin mới có quyền cập nhật bài học!");
  }

  return await lessonRepository.updateLesson(lessonId, {
    title: updateData.title,
    content: updateData.content,
    order: updateData.order,
  });
};

export const deleteLesson = async (lessonId, currentUser) => {
  const lesson = await lessonRepository.findLessonById(lessonId);
  if (!lesson) {
    throw new NotFoundError("Bài học không tồn tại!");
  }

  const isMentor = parseInt(lesson.mentor_id, 10) === parseInt(currentUser.id, 10);
  const isAdmin = currentUser.role === "ADMIN";

  if (!isMentor && !isAdmin) {
    throw new ForbiddenError("Chỉ Mentor phụ trách lớp học này hoặc Admin mới có quyền xóa bài học!");
  }

  return await lessonRepository.deleteLesson(lessonId);
};

export const completeLesson = async (lessonId, currentUser) => {
  const lesson = await lessonRepository.findLessonById(lessonId);
  if (!lesson) {
    throw new NotFoundError("Bài học không tồn tại!");
  }

  const isMember = await classRepository.isMemberInClass(lesson.class_id, currentUser.id);
  if (!isMember) {
    throw new ForbiddenError("Chỉ học viên thuộc lớp học mới có thể đánh dấu hoàn thành bài học!");
  }

  return await lessonRepository.markLessonComplete(lessonId, currentUser.id);
};

export const getClassProgress = async (classId, currentUser, queryMemberId = null) => {
  const classInfo = await classRepository.findClassById(classId);
  if (!classInfo) {
    throw new NotFoundError("Lớp học không tồn tại!");
  }

  const isMentor = parseInt(classInfo.mentor_id, 10) === parseInt(currentUser.id, 10);
  const isAdmin = currentUser.role === "ADMIN";
  const isMember = await classRepository.isMemberInClass(classId, currentUser.id);

  if (!isMentor && !isAdmin && !isMember) {
    throw new ForbiddenError("Bạn không có quyền xem tiến độ học tập của lớp này!");
  }

  let targetMemberId = currentUser.id;
  if ((isAdmin || isMentor) && queryMemberId) {
    targetMemberId = queryMemberId;
  }

  return await lessonRepository.getClassProgress(classId, targetMemberId);
};
