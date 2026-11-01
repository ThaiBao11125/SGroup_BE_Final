import * as classMemberRepo from "../repository/class-member.repository.js";
import * as classRepo from "../repository/class.repository.js"; 
import * as userRepo from "../repository/user.repository.js";
import { NotFoundError, ConflictError, BadRequestError, ForbiddenError } from "../core/error.response.js";

export const addMember = async (classId, memberId) => {
  const classInfo = await classRepo.findClassById(classId);
  if (!classInfo) {
    throw new NotFoundError("Lớp học không tồn tại!");
  }

  const member = await userRepo.findById(memberId);
  if (!member) {
    throw new NotFoundError("Học viên không tồn tại trên hệ thống!");
  }

  try {
    return await classMemberRepo.addMemberToClass(classId, memberId);
  } catch (error) {
    // Bắt lỗi Unique Constraint (23505) theo cấu trúc của leader
    if (error.code === "23505") {
      throw new ConflictError("Học viên này đã tham gia lớp học từ trước!");
    }
    throw error;
  }
};

export const getMembers = async (classId, currentUser) => {
  const classInfo = await classRepo.findClassById(classId);
  if (!classInfo) {
    throw new NotFoundError("Lớp học không tồn tại!");
  }

  if (currentUser.role === "MEMBER") {
    const isMentor = parseInt(classInfo.mentor_id) === parseInt(currentUser.id);
    const isMember = await classMemberRepo.checkMemberExists(classId, currentUser.id);

    if (!isMentor && !isMember) {
      throw new ForbiddenError("Bạn không có quyền xem danh sách thành viên lớp học này!");
    }
  }

  return await classMemberRepo.getMembersByClassId(classId);
};

export const updateStatus = async (classId, memberId, status) => {
  const classInfo = await classRepo.findClassById(classId);
  if (!classInfo) throw new NotFoundError("Lớp học không tồn tại!");

  const validStatuses = ['ACTIVE', 'DROPPED', 'COMPLETED'];
  if (!validStatuses.includes(status)) {
    throw new BadRequestError("Trạng thái không hợp lệ!");
  }

  const updatedMember = await classMemberRepo.updateMemberStatus(classId, memberId, status);
  if (!updatedMember) {
    throw new NotFoundError("Học viên không có trong lớp học này!");
  }

  return updatedMember;
};

export const removeMember = async (classId, memberId) => {
  const classInfo = await classRepo.findClassById(classId);
  if (!classInfo) throw new NotFoundError("Lớp học không tồn tại!");

  const deletedMember = await classMemberRepo.removeMemberFromClass(classId, memberId);
  if (!deletedMember) {
    throw new NotFoundError("Học viên không có trong lớp học này!");
  }

  return deletedMember;
};