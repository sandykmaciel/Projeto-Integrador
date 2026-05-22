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
          projects.id,
          projects.title,
          projects.description,
          projects.created_at,
          projects.updated_at,
          COUNT(tasks.id)::int AS total_tasks,
          COUNT(CASE WHEN tasks.status = 'completed' THEN 1 END)::int AS completed_tasks,
          CASE
            WHEN COUNT(tasks.id) = 0 THEN 0
            ELSE ROUND(
              (COUNT(CASE WHEN tasks.status = 'completed' THEN 1 END)::decimal / COUNT(tasks.id)::decimal) * 100
            )::int
          END AS progress,
          COALESCE(
            JSON_AGG(
              DISTINCT JSONB_BUILD_OBJECT(
                'id', users.id,
                'name', users.name,
                'email', users.email,
                'role', project_members.role
              )
            ) FILTER (WHERE users.id IS NOT NULL),
            '[]'
          ) AS members
        FROM projects
        INNER JOIN project_members
          ON project_members.project_id = projects.id
        LEFT JOIN users
          ON users.id = project_members.user_id
        LEFT JOIN tasks
          ON tasks.project_id = projects.id
        WHERE projects.owner_id = $1
          OR projects.id IN (
            SELECT project_id
            FROM project_members
            WHERE user_id = $1
          )
        GROUP BY projects.id
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