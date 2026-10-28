import * as classRepository from "../repository/class.repository.js";
import * as userRepository from "../repository/user.repository.js";
import { NotFoundError, ForbiddenError, ConflictError, BadRequestError } from "../core/error.response.js";

export const createClass = async ({ name, description, startDate, endDate, mentorId }) => {
  const mentor = await userRepository.findById(mentorId);
  if (!mentor) {
    throw new NotFoundError("Mentor được chỉ định không tồn tại trên hệ thống!");
  }

  return await classRepository.createClass({
    name,
    description,
    startDate: startDate || null,
    endDate: endDate || null,
    mentorId,
  });
};

export const getClasses = async (currentUser) => {
  if (currentUser.role === "ADMIN") {
    return await classRepository.findAllClasses();
  }
  return await classRepository.findClassesByMemberId(currentUser.id);
};

export const getClassById = async (classId, currentUser) => {
  const classInfo = await classRepository.findClassById(classId);
  if (!classInfo) {
    throw new NotFoundError("Lớp học không tồn tại!");
  }

  if (currentUser.role === "MEMBER") {
    const isMentor = parseInt(classInfo.mentor_id) === parseInt(currentUser.id);
    const isMember = await classRepository.isMemberInClass(classId, currentUser.id);

    if (!isMentor && !isMember) {
      throw new ForbiddenError("Bạn không có quyền truy cập thông tin lớp học này!");
    }
  }

  return classInfo;
};

export const updateClass = async (classId, updateData) => {
  const existingClass = await classRepository.findClassById(classId);
  if (!existingClass) {
    throw new NotFoundError("Lớp học không tồn tại!");
  }

  if (updateData.mentorId) {
    const mentor = await userRepository.findById(updateData.mentorId);
    if (!mentor) {
      throw new NotFoundError("Mentor được chỉ định không tồn tại!");
    }
  }

  const startDate = updateData.startDate !== undefined ? updateData.startDate : existingClass.start_date;
  const endDate = updateData.endDate !== undefined ? updateData.endDate : existingClass.end_date;

  if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
    throw new BadRequestError("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu!");
  }

  return await classRepository.updateClass(classId, {
    name: updateData.name,
    description: updateData.description,
    startDate,
    endDate,
    mentorId: updateData.mentorId,
  });
};

export const deleteClass = async (classId) => {
  const existingClass = await classRepository.findClassById(classId);
  if (!existingClass) {
    throw new NotFoundError("Lớp học không tồn tại!");
  }

  return await classRepository.deleteClass(classId);
};

export const addMember = async (classId, memberId) => {
  const classInfo = await classRepository.findClassById(classId);
  if (!classInfo) {
    throw new NotFoundError("Lớp học không tồn tại!");
  }

  const member = await userRepository.findById(memberId);
  if (!member) {
    throw new NotFoundError("Học viên không tồn tại trên hệ thống!");
  }

  const alreadyJoined = await classRepository.isMemberInClass(classId, memberId);
  if (alreadyJoined) {
    throw new ConflictError("Học viên này đã tham gia lớp học từ trước!");
  }

  try {
    return await classRepository.addMemberToClass(classId, memberId);
  } catch (error) {
    if (error.code === "23505") {
      throw new ConflictError("Học viên này đã tham gia lớp học từ trước!");
    }
    throw error;
  }
};

export const getMembers = async (classId, currentUser) => {
  const classInfo = await classRepository.findClassById(classId);
  if (!classInfo) {
    throw new NotFoundError("Lớp học không tồn tại!");
  }

  if (currentUser.role === "MEMBER") {
    const isMentor = parseInt(classInfo.mentor_id) === parseInt(currentUser.id);
    const isMember = await classRepository.isMemberInClass(classId, currentUser.id);

    if (!isMentor && !isMember) {
      throw new ForbiddenError("Bạn không có quyền xem danh sách thành viên lớp học này!");
    }
  }

  return await classRepository.getMembersInClass(classId);
};

export const removeMember = async (classId, memberId) => {
  const classInfo = await classRepository.findClassById(classId);
  if (!classInfo) {
    throw new NotFoundError("Lớp học không tồn tại!");
  }

  const isJoined = await classRepository.isMemberInClass(classId, memberId);
  if (!isJoined) {
    throw new NotFoundError("Học viên không có trong lớp học này!");
  }

  return await classRepository.removeMemberFromClass(classId, memberId);
};
