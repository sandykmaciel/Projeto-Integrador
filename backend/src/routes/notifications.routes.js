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
          notifications.id,
          notifications.user_id,
          notifications.task_id,
          notifications.project_id,
          notifications.title,
          notifications.message,
          notifications.priority,
          notifications.type,
          notifications.due_date,
          notifications.is_read,
          notifications.created_at,
          projects.title AS project_title,
          tasks.title AS task_title
        FROM notifications
        LEFT JOIN projects
          ON projects.id = notifications.project_id
        LEFT JOIN tasks
          ON tasks.id = notifications.task_id
        WHERE notifications.user_id = $1
        ORDER BY notifications.created_at DESC
        LIMIT 100
      `,
      [userId]
    );

    return res.status(200).json({
      notifications: result.rows,
    });
  } catch (error) {
    console.error("List notifications error:", error);

    return res.status(500).json({
      message: "Erro interno ao listar notificações.",
    });
  }
});

router.patch("/:id/read", async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      `
        UPDATE notifications
        SET is_read = true
        WHERE id = $1
          AND user_id = $2
        RETURNING id
      `,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Notificação não encontrada.",
      });
    }

    return res.status(200).json({
      message: "Notificação marcada como lida.",
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);

    return res.status(500).json({
      message: "Erro interno ao marcar notificação como lida.",
    });
  }
});

module.exports = router;