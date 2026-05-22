const express = require("express");

const pool = require("../database/connection");
const ensureAuthenticated = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(ensureAuthenticated);

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

router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
        SELECT
          projects.id,
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
        WHERE projects.owner_id = $1
          OR projects.id IN (
            SELECT project_id
            FROM project_members
            WHERE user_id = $1
          )
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

    const allowedPriorities = ["low", "medium", "high"];
    const priority = allowedPriorities.includes(task.priority)
      ? task.priority
      : "medium";

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
        RETURNING
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

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Projeto e tarefa inicial criados com sucesso.",
      project: createdProject,
      task: taskResult.rows[0],
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

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        message: "Projeto não encontrado.",
      });
    }

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