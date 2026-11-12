import pool from "../config/database.config.js";
import { ClassMember, ClassMemberStatus } from "../entities/class-member.entity.js";

export const addMemberToClass = async (classId, memberId, status = ClassMemberStatus.ACTIVE) => {
  const query = `
    INSERT INTO class_members (class_id, member_id, status)
    VALUES ($1, $2, $3)
    RETURNING id, class_id, member_id, joined_at, status;
  `;
  const result = await pool.query(query, [classId, memberId, status]);
  return ClassMember.fromRow(result.rows[0]);
};

export const getMembersByClassId = async (classId) => {
  const query = `
    SELECT cm.id AS class_member_id, cm.class_id, cm.member_id, cm.joined_at, cm.status,
           u.name, u.email, u.age, u.avatar_url
    FROM class_members cm
    JOIN users u ON cm.member_id = u.id
    WHERE cm.class_id = $1
    ORDER BY cm.joined_at ASC;
  `;
  const result = await pool.query(query, [classId]);
  return ClassMember.fromRows(result.rows);
};

export const checkMemberExists = async (classId, memberId) => {
  const query = `
    SELECT 1 FROM class_members 
    WHERE class_id = $1 AND member_id = $2;
  `;
  const result = await pool.query(query, [classId, memberId]);
  return result.rowCount > 0;
};

export const updateMemberStatus = async (classId, memberId, status) => {
  const query = `
    UPDATE class_members 
    SET status = $1 
    WHERE class_id = $2 AND member_id = $3 
    RETURNING *;
  `;
  const result = await pool.query(query, [status, classId, memberId]);
  return ClassMember.fromRow(result.rows[0]);
};

export const removeMemberFromClass = async (classId, memberId) => {
  const query = `
    DELETE FROM class_members 
    WHERE class_id = $1 AND member_id = $2 
    RETURNING *;
  `;
  const result = await pool.query(query, [classId, memberId]);
  return ClassMember.fromRow(result.rows[0]);
};