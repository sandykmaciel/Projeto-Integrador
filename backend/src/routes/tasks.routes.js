const express = require("express");

const pool = require("../database/connection");
const ensureAuthenticated = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(ensureAuthenticated);

router.get("/my", async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
        SELECT
          tasks.id,
          tasks.project_id,
          tasks.assigned_user_id,
          tasks.title,
          tasks.description,
          tasks.status,
          tasks.priority,
          tasks.due_date,
          tasks.created_at,
          tasks.updated_at,
          projects.title AS project_title
        FROM tasks
        INNER JOIN projects
          ON projects.id = tasks.project_id
        WHERE tasks.assigned_user_id = $1
          AND (
            projects.owner_id = $1
            OR projects.id IN (
              SELECT project_id
              FROM project_members
              WHERE user_id = $1
            )
          )
        ORDER BY
          CASE WHEN tasks.status = 'completed' THEN 1 ELSE 0 END ASC,
          tasks.due_date ASC NULLS LAST,
          tasks.created_at DESC
      `,
      [userId]
    );

    return res.status(200).json({
      tasks: result.rows,
    });
  } catch (error) {
    console.error("List my tasks error:", error);

    return res.status(500).json({
      message: "Erro interno ao listar minhas tarefas.",
    });
  }
});

module.exports = router;