const express = require("express");

const pool = require("../database/connection");
const ensureAuthenticated = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(ensureAuthenticated);

router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
        SELECT
          activity_logs.id,
          activity_logs.project_id,
          activity_logs.task_id,
          activity_logs.user_id,
          activity_logs.action,
          activity_logs.description,
          activity_logs.created_at,
          users.name AS responsible_name,
          users.email AS responsible_email,
          projects.title AS project_title,
          tasks.title AS task_title
        FROM activity_logs
        INNER JOIN projects
          ON projects.id = activity_logs.project_id
        LEFT JOIN users
          ON users.id = activity_logs.user_id
        LEFT JOIN tasks
          ON tasks.id = activity_logs.task_id
        WHERE projects.owner_id = $1
          OR projects.id IN (
            SELECT project_id
            FROM project_members
            WHERE user_id = $1
          )
        ORDER BY activity_logs.created_at DESC
        LIMIT 100
      `,
      [userId]
    );

    return res.status(200).json({
      history: result.rows,
    });
  } catch (error) {
    console.error("List history error:", error);

    return res.status(500).json({
      message: "Erro interno ao listar histórico.",
    });
  }
});

module.exports = router;