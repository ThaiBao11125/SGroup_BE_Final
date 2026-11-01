import pool from "../config/database.config.js";
import { ConflictError } from "../core/error.response.js";

export const createLesson = async ({ classId, title, content, order, createdBy }) => {
  try {
    const query = `
      INSERT INTO lessons (class_id, title, content, "order", created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, class_id, title, content, "order", created_by, created_at, updated_at;
    `;
    const result = await pool.query(query, [classId, title, content, order, createdBy]);
    return result.rows[0];
  } catch (error) {
    if (error.code === "23505") {
      throw new ConflictError("Thứ tự bài học (order) này đã tồn tại trong lớp học!");
    }
    throw error;
  }
};

export const findLessonById = async (id) => {
  const query = `
    SELECT l.*, c.name AS class_name, c.mentor_id, u.name AS creator_name
    FROM lessons l
    JOIN classes c ON l.class_id = c.id
    JOIN users u ON l.created_by = u.id
    WHERE l.id = $1;
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export const findLessonsByClassId = async (classId, memberId = null) => {
  if (memberId) {
    const query = `
      SELECT l.*,
             CASE WHEN lp.id IS NOT NULL THEN TRUE ELSE FALSE END AS is_completed,
             lp.completed_at
      FROM lessons l
      LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.member_id = $2
      WHERE l.class_id = $1
      ORDER BY l."order" ASC;
    `;
    const result = await pool.query(query, [classId, memberId]);
    return result.rows;
  }

  const query = `
    SELECT l.*
    FROM lessons l
    WHERE l.class_id = $1
    ORDER BY l."order" ASC;
  `;
  const result = await pool.query(query, [classId]);
  return result.rows;
};

export const updateLesson = async (id, { title, content, order }) => {
  try {
    const query = `
      UPDATE lessons
      SET title = COALESCE($1, title),
          content = COALESCE($2, content),
          "order" = COALESCE($3, "order"),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, class_id, title, content, "order", created_by, created_at, updated_at;
    `;
    const result = await pool.query(query, [title, content, order, id]);
    return result.rows[0] || null;
  } catch (error) {
    if (error.code === "23505") {
      throw new ConflictError("Thứ tự bài học (order) này đã tồn tại trong lớp học!");
    }
    throw error;
  }
};

export const deleteLesson = async (id) => {
  const query = `DELETE FROM lessons WHERE id = $1 RETURNING *;`;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export const markLessonComplete = async (lessonId, memberId) => {
  const query = `
    INSERT INTO lesson_progress (lesson_id, member_id)
    VALUES ($1, $2)
    ON CONFLICT (lesson_id, member_id) 
    DO UPDATE SET completed_at = CURRENT_TIMESTAMP
    RETURNING id, lesson_id, member_id, completed_at;
  `;
  const result = await pool.query(query, [lessonId, memberId]);
  return result.rows[0];
};

export const getClassProgress = async (classId, memberId) => {
  const query = `
    SELECT 
      (SELECT COUNT(*)::int FROM lessons WHERE class_id = $1) AS total_lessons,
      (SELECT COUNT(*)::int FROM lesson_progress lp 
       JOIN lessons l ON lp.lesson_id = l.id 
       WHERE l.class_id = $1 AND lp.member_id = $2) AS completed_lessons;
  `;
  const result = await pool.query(query, [classId, memberId]);
  const row = result.rows[0];
  const totalLessons = parseInt(row.total_lessons, 10) || 0;
  const completedLessons = parseInt(row.completed_lessons, 10) || 0;
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return {
    totalLessons,
    completedLessons,
    progress,
  };
};

export const getMaxLessonOrder = async (classId) => {
  const query = `SELECT COALESCE(MAX("order"), 0) AS max_order FROM lessons WHERE class_id = $1;`;
  const result = await pool.query(query, [classId]);
  return parseInt(result.rows[0].max_order, 10);
};
