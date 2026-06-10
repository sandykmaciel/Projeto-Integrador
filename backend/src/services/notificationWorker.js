const pool = require("../database/connection");

const ONE_HOUR_IN_MS = 60 * 60 * 1000;
const DUE_SOON_WINDOW_HOURS = 24;
const WORKER_INTERVAL_MS = 60 * 1000;

function getRemainingTimeMessage(dueDate) {
  const now = new Date();
  const due = new Date(dueDate);
  const diffInMs = due.getTime() - now.getTime();

  if (diffInMs < 0) {
    return "tarefa atrasada!";
  }

  const remainingHours = Math.ceil(diffInMs / ONE_HOUR_IN_MS);

  if (remainingHours <= 1) {
    return "vence em até 1 hora!";
  }

  if (remainingHours < 24) {
    return `vence em ${remainingHours} horas!`;
  }

  return "vence em breve!";
}

async function generateDueDateNotifications() {
  try {
    const result = await pool.query(
      `
        SELECT
          tasks.id AS task_id,
          tasks.project_id,
          tasks.assigned_user_id,
          tasks.title AS task_title,
          tasks.priority,
          tasks.due_date,
          projects.owner_id,
          projects.title AS project_title
        FROM tasks
        INNER JOIN projects
          ON projects.id = tasks.project_id
        WHERE tasks.status <> 'completed'
          AND tasks.due_date IS NOT NULL
          AND tasks.due_date <= NOW() + ($1 || ' hours')::interval
      `,
      [DUE_SOON_WINDOW_HOURS]
    );

    for (const task of result.rows) {
      const targetUserId = task.assigned_user_id || task.owner_id;
      const remainingMessage = getRemainingTimeMessage(task.due_date);

      await pool.query(
        `
          INSERT INTO notifications (
            user_id,
            task_id,
            project_id,
            title,
            message,
            priority,
            type,
            due_date
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (user_id, task_id, type)
          WHERE task_id IS NOT NULL AND type = 'due_date'
          DO NOTHING
        `,
        [
          targetUserId,
          task.task_id,
          task.project_id,
          "Tarefa próxima do vencimento",
          `A tarefa "${task.task_title}" do projeto "${task.project_title}" ${remainingMessage}`,
          task.priority || "medium",
          "due_date",
          task.due_date,
        ]
      );
    }
  } catch (error) {
    console.error("Generate due date notifications error:", error);
  }
}

function startNotificationWorker() {
  generateDueDateNotifications();

  setInterval(() => {
    generateDueDateNotifications();
  }, WORKER_INTERVAL_MS);
}

module.exports = {
  startNotificationWorker,
  generateDueDateNotifications,
  getRemainingTimeMessage,
  WORKER_INTERVAL_MS,
};