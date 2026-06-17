const express = require("express");

const pool = require("../database/connection");
const ensureAuthenticated = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(ensureAuthenticated);

const priorityWeight = {
  high: 3,
  medium: 2,
  low: 1,
};

function getPriorityWeight(priority) {
  return priorityWeight[priority] || 0;
}

router.get("/summary", async (req, res) => {
  try {
    const userId = req.user.id;

    const tasksSummaryResult = await pool.query(
      `
        SELECT
          COUNT(*)::int AS total,
          COUNT(CASE WHEN tasks.status = 'completed' THEN 1 END)::int AS completed,
          COUNT(CASE WHEN tasks.status <> 'completed' THEN 1 END)::int AS pending
        FROM tasks
        INNER JOIN projects
          ON projects.id = tasks.project_id
        WHERE projects.owner_id = $1
          OR projects.id IN (
            SELECT project_id
            FROM project_members
            WHERE user_id = $1
          )
      `,
      [userId]
    );

    const projectsSummaryResult = await pool.query(
      `
        SELECT
          COUNT(*)::int AS total,
          COUNT(CASE WHEN project_progress.progress = 100 THEN 1 END)::int AS completed,
          COUNT(CASE WHEN project_progress.progress < 100 THEN 1 END)::int AS pending
        FROM (
          SELECT
            projects.id,
            CASE
              WHEN COUNT(tasks.id) = 0 THEN 0
              ELSE ROUND(
                (
                  COUNT(CASE WHEN tasks.status = 'completed' THEN 1 END)::decimal /
                  COUNT(tasks.id)::decimal
                ) * 100
              )::int
            END AS progress
          FROM projects
          LEFT JOIN tasks
            ON tasks.project_id = projects.id
          WHERE projects.owner_id = $1
            OR projects.id IN (
              SELECT project_id
              FROM project_members
              WHERE user_id = $1
            )
          GROUP BY projects.id
        ) AS project_progress
      `,
      [userId]
    );

    const priorityTasksResult = await pool.query(
      `
        SELECT
          tasks.id,
          tasks.title AS task_title,
          tasks.priority,
          tasks.created_at,
          tasks.due_date,
          projects.id AS project_id,
          projects.title AS project_title
        FROM tasks
        INNER JOIN projects
          ON projects.id = tasks.project_id
        WHERE tasks.status <> 'completed'
          AND (
            projects.owner_id = $1
            OR projects.id IN (
              SELECT project_id
              FROM project_members
              WHERE user_id = $1
            )
          )
        ORDER BY tasks.due_date ASC NULLS LAST, tasks.created_at DESC
        LIMIT 100
      `,
      [userId]
    );

    const priorityTasks = priorityTasksResult.rows.map((task) => ({
      ...task,
      priority_weight: getPriorityWeight(task.priority),
    }));

    return res.status(200).json({
      tasksSummary: tasksSummaryResult.rows[0],
      projectsSummary: projectsSummaryResult.rows[0],
      priorityTasks,
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);

    return res.status(500).json({
      message: "Erro interno ao carregar resumo do dashboard.",
    });
  }
});

module.exports = router;