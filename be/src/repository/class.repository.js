import pool from "../config/database.config.js";

export const createClass = async ({ name, description, startDate, endDate, mentorId }) => {
  const query = `
    INSERT INTO classes (name, description, start_date, end_date, mentor_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, name, description, start_date, end_date, mentor_id, created_at, updated_at;
  `;
  const result = await pool.query(query, [name, description, startDate, endDate, mentorId]);
  return result.rows[0];
};

export const findClassById = async (id) => {
  const query = `
    SELECT c.*, u.name AS mentor_name, u.email AS mentor_email
    FROM classes c
    JOIN users u ON c.mentor_id = u.id
    WHERE c.id = $1;
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export const findAllClasses = async () => {
  const query = `
    SELECT c.*, u.name AS mentor_name, u.email AS mentor_email,
           COUNT(cm.member_id)::int AS total_members
    FROM classes c
    JOIN users u ON c.mentor_id = u.id
    LEFT JOIN class_members cm ON c.id = cm.class_id
    GROUP BY c.id, u.id
    ORDER BY c.id ASC;
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const findClassesByMemberId = async (memberId) => {
  const query = `
    SELECT DISTINCT c.*, u.name AS mentor_name, u.email AS mentor_email
    FROM classes c
    JOIN users u ON c.mentor_id = u.id
    LEFT JOIN class_members cm ON c.id = cm.class_id
    WHERE cm.member_id = $1 OR c.mentor_id = $1
    ORDER BY c.id ASC;
  `;
  const result = await pool.query(query, [memberId]);
  return result.rows;
};

export const updateClass = async (id, { name, description, startDate, endDate, mentorId }) => {
  const query = `
    UPDATE classes
    SET name = COALESCE($1, name),
        description = COALESCE($2, description),
        start_date = COALESCE($3, start_date),
        end_date = COALESCE($4, end_date),
        mentor_id = COALESCE($5, mentor_id),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $6
    RETURNING *;
  `;
  const result = await pool.query(query, [name, description, startDate, endDate, mentorId, id]);
  return result.rows[0] || null;
};

export const deleteClass = async (id) => {
  const query = `DELETE FROM classes WHERE id = $1 RETURNING *;`;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export const isMemberInClass = async (classId, memberId) => {
  const query = `
    SELECT 1 FROM class_members 
    WHERE class_id = $1 AND member_id = $2;
  `;
  const result = await pool.query(query, [classId, memberId]);
  return result.rowCount > 0;
};

export const addMemberToClass = async (classId, memberId, status = "ACTIVE") => {
  const query = `
    INSERT INTO class_members (class_id, member_id, status)
    VALUES ($1, $2, $3)
    RETURNING class_id, member_id, joined_at, status;
  `;
  const result = await pool.query(query, [classId, memberId, status]);
  return result.rows[0];
};

export const getMembersInClass = async (classId) => {
  const query = `
    SELECT cm.class_id, cm.member_id, cm.joined_at, cm.status,
           u.name, u.email, u.age, u.avatar_url
    FROM class_members cm
    JOIN users u ON cm.member_id = u.id
    WHERE cm.class_id = $1
    ORDER BY cm.joined_at ASC;
  `;
  const result = await pool.query(query, [classId]);
  return result.rows;
};

export const removeMemberFromClass = async (classId, memberId) => {
  const query = `
    DELETE FROM class_members 
    WHERE class_id = $1 AND member_id = $2 
    RETURNING *;
  `;
  const result = await pool.query(query, [classId, memberId]);
  return result.rows[0] || null;
};
