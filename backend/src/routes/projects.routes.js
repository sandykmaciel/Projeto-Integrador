const express = require("express");

const pool = require("../database/connection");
const ensureAuthenticated = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(ensureAuthenticated);

const TASK_RETURNING_FIELDS = `
  id,
  project_id,
  assigned_user_id,
  title,
  description,
  status,
  priority,
  due_date,
  created_at,
  updated_at
`;

const statusLabels = {
  pending: "Pendente",
  in_progress: "Em andamento",
  completed: "Concluída",
};

const taskActionDescriptions = {
  task_created: "criou",
  task_updated: "atualizou",
  task_deleted: "excluiu",
};

function isDateBeforeToday(date) {
  const informedDate = new Date(date);
  const today = new Date();

  informedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return informedDate < today;
}

function normalizeMemberIds(memberIds, userId) {
  const safeMemberIds = Array.isArray(memberIds) ? memberIds : [];

  return [...new Set([userId, ...safeMemberIds])];
}

function normalizeTaskStatus(status) {
  const allowedStatuses = ["pending", "in_progress", "completed"];

  return allowedStatuses.includes(status) ? status : "pending";
}

function normalizeTaskPriority(priority) {
  const allowedPriorities = ["low", "medium", "high"];

  return allowedPriorities.includes(priority) ? priority : "medium";
}

function getStatusLabel(status) {
  return statusLabels[status] || status;
}

function getUserDisplayName(user) {
  return user?.name || user?.email || "Usuário";
}

async function createActivityLog({
  db = pool,
  projectId,
  taskId,
  userId,
  action,
  description,
}) {
  await db.query(
    `
      INSERT INTO activity_logs (
        project_id,
        task_id,
        user_id,
        action,
        description
      )
      VALUES ($1, $2, $3, $4, $5)
    `,
    [projectId, taskId || null, userId || null, action, description]
  );
}

async function createTaskHistory({
  db = pool,
  projectId,
  taskId,
  userId,
  user,
  action,
  taskTitle,
}) {
  const actionDescription = taskActionDescriptions[action] || "alterou";

  await createActivityLog({
    db,
    projectId,
    taskId,
    userId,
    action,
    description: `${getUserDisplayName(user)} ${actionDescription} a tarefa "${taskTitle}".`,
  });
}

async function createTaskStatusHistory({
  projectId,
  taskId,
  userId,
  user,
  taskTitle,
  previousStatus,
  nextStatus,
}) {
  await createActivityLog({
    projectId,
    taskId,
    userId,
    action: "task_status_changed",
    description: `${getUserDisplayName(user)} alterou o status da tarefa "${taskTitle}" de "${getStatusLabel(previousStatus)}" para "${getStatusLabel(nextStatus)}".`,
  });
}

async function findTaskByProject(taskId, projectId, fields = "id, title, status") {
  const result = await pool.query(
    `
      SELECT ${fields}
      FROM tasks
      WHERE id = $1
        AND project_id = $2
      LIMIT 1
    `,
    [taskId, projectId]
  );

  return result.rows[0] || null;
}

function sendTaskNotFound(res) {
  return res.status(404).json({
    message: "Tarefa não encontrada.",
  });
}

function buildProjectDetailsQuery(whereClause) {
  return `
    SELECT
      projects.id,
      projects.owner_id,
      projects.title,
      projects.description,
      projects.created_at,
      projects.updated_at,
      COALESCE(tasks_summary.total_tasks, 0)::int AS total_tasks,
      COALESCE(tasks_summary.completed_tasks, 0)::int AS completed_tasks,
      CASE
        WHEN COALESCE(tasks_summary.total_tasks, 0) = 0 THEN 0
        ELSE ROUND(
          (tasks_summary.completed_tasks::decimal / tasks_summary.total_tasks::decimal) * 100
        )::int
      END AS progress,
      COALESCE(members_summary.members, '[]') AS members
    FROM projects
    LEFT JOIN (
      SELECT
        project_id,
        COUNT(*)::int AS total_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::int AS completed_tasks
      FROM tasks
      GROUP BY project_id
    ) AS tasks_summary
      ON tasks_summary.project_id = projects.id
    LEFT JOIN (
      SELECT
        project_members.project_id,
        JSON_AGG(
          JSONB_BUILD_OBJECT(
            'id', users.id,
            'name', users.name,
            'email', users.email,
            'role', project_members.role
          )
          ORDER BY project_members.created_at ASC
        ) AS members
      FROM project_members
      INNER JOIN users
        ON users.id = project_members.user_id
      GROUP BY project_members.project_id
    ) AS members_summary
      ON members_summary.project_id = projects.id
    ${whereClause}
  `;
}

async function userHasProjectAccess(projectId, userId) {
  const result = await pool.query(
    `
      SELECT projects.id
      FROM projects
      LEFT JOIN project_members
        ON project_members.project_id = projects.id
      WHERE projects.id = $1
        AND (
          projects.owner_id = $2
          OR project_members.user_id = $2
        )
      LIMIT 1
    `,
    [projectId, userId]
  );

  return result.rows.length > 0;
}

async function userIsProjectOwner(projectId, userId) {
  const result = await pool.query(
    `
      SELECT id
      FROM projects
      WHERE id = $1
        AND owner_id = $2
      LIMIT 1
    `,
    [projectId, userId]
  );

  return result.rows.length > 0;
}

async function isUserProjectMember(projectId, userId) {
  const result = await pool.query(
    `
      SELECT id
      FROM project_members
      WHERE project_id = $1
        AND user_id = $2
      LIMIT 1
    `,
    [projectId, userId]
  );

  return result.rows.length > 0;
}

async function validateProjectAccess(projectId, userId) {
  const hasAccess = await userHasProjectAccess(projectId, userId);

  if (!hasAccess) {
    return {
      isValid: false,
      status: 404,
      message: "Projeto não encontrado.",
    };
  }

  return {
    isValid: true,
  };
}

async function validateTaskPayload(projectId, userId, payload) {
  const { title, dueDate, assignedUserId } = payload;

  if (!title || !title.trim()) {
    return {
      isValid: false,
      status: 400,
      message: "Informe o título da tarefa.",
    };
  }

  if (!dueDate) {
    return {
      isValid: false,
      status: 400,
      message: "Informe a data final da tarefa.",
    };
  }

  if (isDateBeforeToday(dueDate)) {
    return {
      isValid: false,
      status: 400,
      message: "A data final da tarefa não pode ser anterior à data atual.",
    };
  }

  const accessValidation = await validateProjectAccess(projectId, userId);

  if (!accessValidation.isValid) {
    return accessValidation;
  }

  const responsibleId = assignedUserId || userId;
  const isResponsibleMember = await isUserProjectMember(projectId, responsibleId);

  if (!isResponsibleMember) {
    return {
      isValid: false,
      status: 400,
      message: "O responsável da tarefa deve ser membro do projeto.",
    };
  }

  return {
    isValid: true,
    responsibleId,
  };
}

function sendValidationError(res, validation) {
  return res.status(validation.status).json({
    message: validation.message,
  });
}

router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
        ${buildProjectDetailsQuery(`
          WHERE projects.owner_id = $1
            OR projects.id IN (
              SELECT project_id
              FROM project_members
              WHERE user_id = $1
            )
        `)}
        ORDER BY projects.created_at DESC
      `,
      [userId]
    );

    return res.status(200).json({
      projects: result.rows,
    });
  } catch (error) {
    console.error("List projects error:", error);

    return res.status(500).json({
      message: "Erro interno ao listar projetos.",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      `
        ${buildProjectDetailsQuery(`
          WHERE projects.id = $1
            AND (
              projects.owner_id = $2
              OR projects.id IN (
                SELECT project_id
                FROM project_members
                WHERE user_id = $2
              )
            )
        `)}
        LIMIT 1
      `,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Projeto não encontrado.",
      });
    }

    return res.status(200).json({
      project: result.rows[0],
    });
  } catch (error) {
    console.error("Project details error:", error);

    return res.status(500).json({
      message: "Erro interno ao buscar detalhes do projeto.",
    });
  }
});

router.get("/:id/tasks", async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const accessValidation = await validateProjectAccess(id, userId);

    if (!accessValidation.isValid) {
      return sendValidationError(res, accessValidation);
    }

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
          users.name AS responsible_name,
          users.email AS responsible_email
        FROM tasks
        LEFT JOIN users
          ON users.id = tasks.assigned_user_id
        WHERE tasks.project_id = $1
        ORDER BY tasks.created_at DESC
      `,
      [id]
    );

    return res.status(200).json({
      tasks: result.rows,
    });
  } catch (error) {
    console.error("List project tasks error:", error);

    return res.status(500).json({
      message: "Erro interno ao listar tarefas do projeto.",
    });
  }
});

router.post("/with-initial-task", async (req, res) => {
  const client = await pool.connect();

  try {
    const userId = req.user.id;
    const { project, task } = req.body;

    if (!project?.title || !project.title.trim()) {
      return res.status(400).json({
        message: "Informe o nome do projeto.",
      });
    }

    if (!task?.title || !task.title.trim()) {
      return res.status(400).json({
        message: "Informe o título da tarefa inicial.",
      });
    }

    if (!task?.dueDate) {
      return res.status(400).json({
        message: "Informe a data final da tarefa inicial.",
      });
    }

    if (isDateBeforeToday(task.dueDate)) {
      return res.status(400).json({
        message: "A data final da tarefa não pode ser anterior à data atual.",
      });
    }

    const priority = normalizeTaskPriority(task.priority);
    const memberIds = normalizeMemberIds(project.memberIds, userId);
    const assignedUserId = task.assignedUserId || userId;

    if (!memberIds.includes(assignedUserId)) {
      return res.status(400).json({
        message: "O responsável da tarefa deve ser membro do projeto.",
      });
    }

    await client.query("BEGIN");

    const membersResult = await client.query(
      `
        SELECT id
        FROM users
        WHERE id = ANY($1::uuid[])
      `,
      [memberIds]
    );

    if (membersResult.rows.length !== memberIds.length) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Um ou mais membros informados não foram encontrados.",
      });
    }

    const projectResult = await client.query(
      `
        INSERT INTO projects (owner_id, title, description)
        VALUES ($1, $2, $3)
        RETURNING id, owner_id, title, description, created_at, updated_at
      `,
      [userId, project.title.trim(), project.description?.trim() || null]
    );

    const createdProject = projectResult.rows[0];

    for (const memberId of memberIds) {
      await client.query(
        `
          INSERT INTO project_members (project_id, user_id, role)
          VALUES ($1, $2, $3)
        `,
        [createdProject.id, memberId, memberId === userId ? "owner" : "member"]
      );
    }

    const taskResult = await client.query(
      `
        INSERT INTO tasks (
          project_id,
          assigned_user_id,
          title,
          description,
          status,
          priority,
          due_date
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING ${TASK_RETURNING_FIELDS}
      `,
      [
        createdProject.id,
        assignedUserId,
        task.title.trim(),
        task.description?.trim() || null,
        "pending",
        priority,
        task.dueDate,
      ]
    );

    const createdTask = taskResult.rows[0];

    await createTaskHistory({
      db: client,
      projectId: createdProject.id,
      taskId: createdTask.id,
      userId,
      user: req.user,
      action: "task_created",
      taskTitle: createdTask.title,
    });

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Projeto e tarefa inicial criados com sucesso.",
      project: createdProject,
      task: createdTask,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Create project with initial task error:", error);

    return res.status(500).json({
      message: "Erro interno ao criar projeto com tarefa inicial.",
    });
  } finally {
    client.release();
  }
});

router.post("/:id/tasks", async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const {
      title,
      description,
      dueDate,
      priority,
      assignedUserId,
      status,
    } = req.body;

    const validation = await validateTaskPayload(id, userId, {
      title,
      dueDate,
      assignedUserId,
    });

    if (!validation.isValid) {
      return sendValidationError(res, validation);
    }

    const result = await pool.query(
      `
        INSERT INTO tasks (
          project_id,
          assigned_user_id,
          title,
          description,
          status,
          priority,
          due_date
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING ${TASK_RETURNING_FIELDS}
      `,
      [
        id,
        validation.responsibleId,
        title.trim(),
        description?.trim() || null,
        normalizeTaskStatus(status),
        normalizeTaskPriority(priority),
        dueDate,
      ]
    );

    const createdTask = result.rows[0];

    await createTaskHistory({
      projectId: id,
      taskId: createdTask.id,
      userId,
      user: req.user,
      action: "task_created",
      taskTitle: createdTask.title,
    });

    return res.status(201).json({
      message: "Tarefa criada com sucesso.",
      task: createdTask,
    });
  } catch (error) {
    console.error("Create project task error:", error);

    return res.status(500).json({
      message: "Erro interno ao criar tarefa.",
    });
  }
});

router.post("/", async (req, res) => {
  const client = await pool.connect();

  try {
    const userId = req.user.id;
    const { title, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Informe o título do projeto.",
      });
    }

    await client.query("BEGIN");

    const projectResult = await client.query(
      `
        INSERT INTO projects (owner_id, title, description)
        VALUES ($1, $2, $3)
        RETURNING id, owner_id, title, description, created_at, updated_at
      `,
      [userId, title.trim(), description?.trim() || null]
    );

    const project = projectResult.rows[0];

    await client.query(
      `
        INSERT INTO project_members (project_id, user_id, role)
        VALUES ($1, $2, $3)
      `,
      [project.id, userId, "owner"]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Projeto criado com sucesso.",
      project: {
        ...project,
        total_tasks: 0,
        completed_tasks: 0,
        progress: 0,
        members: [],
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Create project error:", error);

    return res.status(500).json({
      message: "Erro interno ao criar projeto.",
    });
  } finally {
    client.release();
  }
});

router.put("/:id/tasks/:taskId", async (req, res) => {
  try {
    const userId = req.user.id;
    const { id, taskId } = req.params;
    const {
      title,
      description,
      dueDate,
      priority,
      assignedUserId,
      status,
    } = req.body;

    const validation = await validateTaskPayload(id, userId, {
      title,
      dueDate,
      assignedUserId,
    });

    if (!validation.isValid) {
      return sendValidationError(res, validation);
    }

    const currentTask = await findTaskByProject(taskId, id);

    if (!currentTask) {
      return sendTaskNotFound(res);
    }

    const result = await pool.query(
      `
        UPDATE tasks
        SET
          assigned_user_id = $1,
          title = $2,
          description = $3,
          status = $4,
          priority = $5,
          due_date = $6,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
          AND project_id = $8
        RETURNING ${TASK_RETURNING_FIELDS}
      `,
      [
        validation.responsibleId,
        title.trim(),
        description?.trim() || null,
        normalizeTaskStatus(status),
        normalizeTaskPriority(priority),
        dueDate,
        taskId,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return sendTaskNotFound(res);
    }

    const updatedTask = result.rows[0];

    if (currentTask.status !== updatedTask.status) {
      await createTaskStatusHistory({
        projectId: id,
        taskId,
        userId,
        user: req.user,
        taskTitle: updatedTask.title,
        previousStatus: currentTask.status,
        nextStatus: updatedTask.status,
      });
    } else {
      await createTaskHistory({
        projectId: id,
        taskId,
        userId,
        user: req.user,
        action: "task_updated",
        taskTitle: updatedTask.title,
      });
    }

    return res.status(200).json({
      message: "Tarefa atualizada com sucesso.",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Update project task error:", error);

    return res.status(500).json({
      message: "Erro interno ao atualizar tarefa.",
    });
  }
});

router.patch("/:id/tasks/:taskId/toggle", async (req, res) => {
  try {
    const userId = req.user.id;
    const { id, taskId } = req.params;

    const accessValidation = await validateProjectAccess(id, userId);

    if (!accessValidation.isValid) {
      return sendValidationError(res, accessValidation);
    }

    const currentTask = await findTaskByProject(taskId, id);

    if (!currentTask) {
      return sendTaskNotFound(res);
    }

    const result = await pool.query(
      `
        UPDATE tasks
        SET
          status = CASE
            WHEN status = 'completed' THEN 'pending'
            ELSE 'completed'
          END,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
          AND project_id = $2
        RETURNING ${TASK_RETURNING_FIELDS}
      `,
      [taskId, id]
    );

    if (result.rows.length === 0) {
      return sendTaskNotFound(res);
    }

    const updatedTask = result.rows[0];

    await createTaskStatusHistory({
      projectId: id,
      taskId,
      userId,
      user: req.user,
      taskTitle: updatedTask.title,
      previousStatus: currentTask.status,
      nextStatus: updatedTask.status,
    });

    return res.status(200).json({
      message: "Status da tarefa atualizado com sucesso.",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Toggle project task error:", error);

    return res.status(500).json({
      message: "Erro interno ao atualizar status da tarefa.",
    });
  }
});

router.delete("/:id/tasks/:taskId", async (req, res) => {
  try {
    const userId = req.user.id;
    const { id, taskId } = req.params;

    const accessValidation = await validateProjectAccess(id, userId);

    if (!accessValidation.isValid) {
      return sendValidationError(res, accessValidation);
    }

    const currentTask = await findTaskByProject(taskId, id, "id, title");

    if (!currentTask) {
      return sendTaskNotFound(res);
    }

    const result = await pool.query(
      `
        DELETE FROM tasks
        WHERE id = $1
          AND project_id = $2
        RETURNING id
      `,
      [taskId, id]
    );

    if (result.rows.length === 0) {
      return sendTaskNotFound(res);
    }

    await createTaskHistory({
      projectId: id,
      taskId: null,
      userId,
      user: req.user,
      action: "task_deleted",
      taskTitle: currentTask.title,
    });

    return res.status(200).json({
      message: "Tarefa excluída com sucesso.",
    });
  } catch (error) {
    console.error("Delete project task error:", error);

    return res.status(500).json({
      message: "Erro interno ao excluir tarefa.",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Informe o título do projeto.",
      });
    }

    const isOwner = await userIsProjectOwner(id, userId);

    if (!isOwner) {
      return res.status(404).json({
        message: "Projeto não encontrado.",
      });
    }

    const projectResult = await pool.query(
      `
        UPDATE projects
        SET
          title = $1,
          description = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
          AND owner_id = $4
        RETURNING id, owner_id, title, description, created_at, updated_at
      `,
      [title.trim(), description?.trim() || null, id, userId]
    );

    return res.status(200).json({
      message: "Projeto atualizado com sucesso.",
      project: projectResult.rows[0],
    });
  } catch (error) {
    console.error("Update project error:", error);

    return res.status(500).json({
      message: "Erro interno ao atualizar projeto.",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const isOwner = await userIsProjectOwner(id, userId);

    if (!isOwner) {
      return res.status(404).json({
        message: "Projeto não encontrado.",
      });
    }

    const deleteResult = await pool.query(
      `
        DELETE FROM projects
        WHERE id = $1
          AND owner_id = $2
        RETURNING id
      `,
      [id, userId]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({
        message: "Projeto não encontrado.",
      });
    }

    return res.status(200).json({
      message: "Projeto excluído com sucesso.",
    });
  } catch (error) {
    console.error("Delete project error:", error);

    return res.status(500).json({
      message: "Erro interno ao excluir projeto.",
    });
  }
});

module.exports = router;