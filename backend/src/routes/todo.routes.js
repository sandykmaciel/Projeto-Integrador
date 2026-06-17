const express = require("express");

const pool = require("../database/connection");
const ensureAuthenticated = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(ensureAuthenticated);

async function findUserTodoList(listId, userId) {
  const result = await pool.query(
    `
      SELECT id
      FROM todo_lists
      WHERE id = $1
        AND user_id = $2
      LIMIT 1
    `,
    [listId, userId]
  );

  return result.rows[0] || null;
}

router.get("/lists", async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
        SELECT
          todo_lists.id,
          todo_lists.title,
          todo_lists.created_at,
          todo_lists.updated_at,
          COALESCE(
            JSON_AGG(
              JSONB_BUILD_OBJECT(
                'id', todo_items.id,
                'title', todo_items.title,
                'is_checked', todo_items.is_checked,
                'created_at', todo_items.created_at,
                'updated_at', todo_items.updated_at
              )
              ORDER BY todo_items.created_at ASC
            ) FILTER (WHERE todo_items.id IS NOT NULL),
            '[]'
          ) AS items
        FROM todo_lists
        LEFT JOIN todo_items
          ON todo_items.list_id = todo_lists.id
        WHERE todo_lists.user_id = $1
        GROUP BY todo_lists.id
        ORDER BY todo_lists.created_at DESC
      `,
      [userId]
    );

    return res.status(200).json({
      lists: result.rows,
    });
  } catch (error) {
    console.error("List todo lists error:", error);

    return res.status(500).json({
      message: "Erro interno ao listar listas.",
    });
  }
});

router.post("/lists", async (req, res) => {
  try {
    const userId = req.user.id;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Informe o título da lista.",
      });
    }

    const result = await pool.query(
      `
        INSERT INTO todo_lists (user_id, title)
        VALUES ($1, $2)
        RETURNING id, title, created_at, updated_at
      `,
      [userId, title.trim()]
    );

    return res.status(201).json({
      message: "Lista criada com sucesso.",
      list: {
        ...result.rows[0],
        items: [],
      },
    });
  } catch (error) {
    console.error("Create todo list error:", error);

    return res.status(500).json({
      message: "Erro interno ao criar lista.",
    });
  }
});

router.delete("/lists/:listId", async (req, res) => {
  try {
    const userId = req.user.id;
    const { listId } = req.params;

    const result = await pool.query(
      `
        DELETE FROM todo_lists
        WHERE id = $1
          AND user_id = $2
        RETURNING id
      `,
      [listId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Lista não encontrada.",
      });
    }

    return res.status(200).json({
      message: "Lista removida com sucesso.",
    });
  } catch (error) {
    console.error("Delete todo list error:", error);

    return res.status(500).json({
      message: "Erro interno ao remover lista.",
    });
  }
});

router.post("/lists/:listId/items", async (req, res) => {
  try {
    const userId = req.user.id;
    const { listId } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Informe o nome do item.",
      });
    }

    const list = await findUserTodoList(listId, userId);

    if (!list) {
      return res.status(404).json({
        message: "Lista não encontrada.",
      });
    }

    const result = await pool.query(
      `
        INSERT INTO todo_items (list_id, title)
        VALUES ($1, $2)
        RETURNING id, title, is_checked, created_at, updated_at
      `,
      [listId, title.trim()]
    );

    return res.status(201).json({
      message: "Item adicionado com sucesso.",
      item: result.rows[0],
    });
  } catch (error) {
    console.error("Create todo item error:", error);

    return res.status(500).json({
      message: "Erro interno ao adicionar item.",
    });
  }
});

router.patch("/lists/:listId/items/:itemId/toggle", async (req, res) => {
  try {
    const userId = req.user.id;
    const { listId, itemId } = req.params;

    const list = await findUserTodoList(listId, userId);

    if (!list) {
      return res.status(404).json({
        message: "Lista não encontrada.",
      });
    }

    const result = await pool.query(
      `
        UPDATE todo_items
        SET
          is_checked = NOT is_checked,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
          AND list_id = $2
        RETURNING id, title, is_checked, created_at, updated_at
      `,
      [itemId, listId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Item não encontrado.",
      });
    }

    return res.status(200).json({
      message: "Item atualizado com sucesso.",
      item: result.rows[0],
    });
  } catch (error) {
    console.error("Toggle todo item error:", error);

    return res.status(500).json({
      message: "Erro interno ao atualizar item.",
    });
  }
});

router.delete("/lists/:listId/items/:itemId", async (req, res) => {
  try {
    const userId = req.user.id;
    const { listId, itemId } = req.params;

    const list = await findUserTodoList(listId, userId);

    if (!list) {
      return res.status(404).json({
        message: "Lista não encontrada.",
      });
    }

    const result = await pool.query(
      `
        DELETE FROM todo_items
        WHERE id = $1
          AND list_id = $2
        RETURNING id
      `,
      [itemId, listId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Item não encontrado.",
      });
    }

    return res.status(200).json({
      message: "Item removido com sucesso.",
    });
  } catch (error) {
    console.error("Delete todo item error:", error);

    return res.status(500).json({
      message: "Erro interno ao remover item.",
    });
  }
});

module.exports = router;