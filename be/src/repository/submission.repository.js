import pool from "../config/database.config.js";
import { ConflictError } from "../core/error.response.js";

export const createSubmission = async ({ assignmentId, memberId, content, repositoryUrl }) => {
  try {
    const query = `
      INSERT INTO submissions (assignment_id, member_id, content, repository_url)
      VALUES ($1, $2, $3, $4)
      RETURNING id, assignment_id, member_id, content, repository_url, submitted_at,
                score, feedback, reviewed_by, reviewed_at, status;
    `;
    const result = await pool.query(query, [assignmentId, memberId, content, repositoryUrl]);
    return result.rows[0];
  } catch (error) {
    if (error.code === "23505") {
      throw new ConflictError("Bạn đã nộp bài cho bài tập này rồi!");
    }
    throw error;
  }
};

export const findSubmissionsByAssignmentId = async (assignmentId, memberId = null) => {
  const values = [assignmentId];
  let memberFilter = "";

  if (memberId !== null) {
    values.push(memberId);
    memberFilter = `AND s.member_id = $${values.length}`;
  }

  const query = `
    SELECT s.id, s.assignment_id, s.member_id, s.content, s.repository_url, s.submitted_at,
           s.score, s.feedback, s.reviewed_by, s.reviewed_at, s.status,
           u.name AS member_name, u.email AS member_email, u.avatar_url AS member_avatar,
           reviewer.name AS reviewer_name, reviewer.email AS reviewer_email
    FROM submissions s
    JOIN users u ON s.member_id = u.id
    LEFT JOIN users reviewer ON s.reviewed_by = reviewer.id
    WHERE s.assignment_id = $1
    ${memberFilter}
    ORDER BY s.submitted_at DESC, s.id DESC;
  `;
  const result = await pool.query(query, values);
  return result.rows;
};

export const findSubmissionById = async (id) => {
  const query = `
    SELECT s.id, s.assignment_id, s.member_id, s.content, s.repository_url, s.submitted_at,
           s.score, s.feedback, s.reviewed_by, s.reviewed_at, s.status,
           a.title AS assignment_title, a.maximum_score, a.deadline, a.class_id,
           c.name AS class_name, c.mentor_id,
           u.name AS member_name, u.email AS member_email, u.avatar_url AS member_avatar,
           reviewer.name AS reviewer_name, reviewer.email AS reviewer_email
    FROM submissions s
    JOIN assignments a ON s.assignment_id = a.id
    JOIN classes c ON a.class_id = c.id
    JOIN users u ON s.member_id = u.id
    LEFT JOIN users reviewer ON s.reviewed_by = reviewer.id
    WHERE s.id = $1;
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export const findSubmissionByAssignmentAndMember = async (assignmentId, memberId) => {
  const query = `
    SELECT * FROM submissions 
    WHERE assignment_id = $1 AND member_id = $2;
  `;
  const result = await pool.query(query, [assignmentId, memberId]);
  return result.rows[0] || null;
};

export const reviewSubmission = async (id, { score, feedback, reviewerId }) => {
  const query = `
    UPDATE submissions
    SET score = $1,
        feedback = $2,
        reviewed_by = $3,
        reviewed_at = CURRENT_TIMESTAMP,
        status = 'REVIEWED'
    WHERE id = $4
    RETURNING id, assignment_id, member_id, content, repository_url, submitted_at,
              score, feedback, reviewed_by, reviewed_at, status;
  `;
  const result = await pool.query(query, [score, feedback, reviewerId, id]);
  return result.rows[0] || null;
};
