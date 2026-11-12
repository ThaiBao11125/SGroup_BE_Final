import pool from "../config/database.config.js";
import { Assignment } from "../entities/assignment.entity.js";

export const createAssignment = async ({ classId, title, description, deadline, maximumScore, createdBy }) => {
  const query = `
    INSERT INTO assignments (class_id, title, description, deadline, maximum_score, created_by)
    VALUES ($1, $2, $3, $4, COALESCE($5, 10.00), $6)
    RETURNING id, class_id, title, description, deadline, maximum_score, created_by, created_at, updated_at;
  `;
  const result = await pool.query(query, [classId, title, description, deadline, maximumScore, createdBy]);
  return Assignment.fromRow(result.rows[0]);
};

export const findAssignmentsByClassId = async (classId) => {
  const query = `
    SELECT id, class_id, title, description, deadline, maximum_score, created_by, created_at, updated_at
    FROM assignments
    WHERE class_id = $1
    ORDER BY created_at DESC, id DESC;
  `;
  const result = await pool.query(query, [classId]);
  return Assignment.fromRows(result.rows);
};

export const findAssignmentById = async (id) => {
  const query = `
    SELECT id, class_id, title, description, deadline, maximum_score, created_by, created_at, updated_at
    FROM assignments
    WHERE id = $1;
  `;
  const result = await pool.query(query, [id]);
  return Assignment.fromRow(result.rows[0]);
};

const UPDATABLE_COLUMNS = {
  title: "title",
  description: "description",
  deadline: "deadline",
  maximumScore: "maximum_score",
};

export const updateAssignmentById = async (id, fields) => {
  const sets = [];
  const values = [];

  for (const [key, column] of Object.entries(UPDATABLE_COLUMNS)) {
    if (Object.hasOwn(fields, key) && fields[key] !== undefined) {
      values.push(fields[key]);
      sets.push(`${column} = $${values.length}`);
    }
  }

  values.push(id);
  const query = `
    UPDATE assignments
    SET ${sets.join(", ")}, updated_at = NOW()
    WHERE id = $${values.length}
    RETURNING id, class_id, title, description, deadline, maximum_score, created_by, created_at, updated_at;
  `;
  const result = await pool.query(query, values);
  return Assignment.fromRow(result.rows[0]);
};

export const deleteAssignmentById = async (id) => {
  const client = await pool.connect();
  let releaseError;

  try {
    await client.query("BEGIN");

    const locked = await client.query(
      `SELECT id FROM assignments WHERE id = $1 FOR UPDATE;`,
      [id]
    );

    if (locked.rowCount === 0) {
      await client.query("ROLLBACK");
      return { status: "NOT_FOUND" };
    }

    const check = await client.query(
      `SELECT EXISTS (
        SELECT 1 FROM submissions WHERE assignment_id = $1
      ) AS has_submissions;`,
      [id]
    );

    if (check.rows[0].has_submissions) {
      await client.query("ROLLBACK");
      return { status: "HAS_SUBMISSIONS" };
    }

    const result = await client.query(
      `DELETE FROM assignments
       WHERE id = $1
       RETURNING id, class_id, title;`,
      [id]
    );

    await client.query("COMMIT");

    return {
      status: "DELETED",
      assignment: Assignment.fromRow(result.rows[0])
    };
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      releaseError = rollbackError;
    }

    throw error;
  } finally {
    client.release(releaseError);
  }
};