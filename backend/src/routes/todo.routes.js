const express = require("express");

const pool = require("../database/connection");
const ensureAuthenticated = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(ensureAuthenticated);

function sendError(res, status, message) {
  return res.status(status).json({
    message,
  });
}

function sendInternalError(res, error, logMessage, responseMessage) {
  console.error(logMessage, error);

  return sendError(res, 500, responseMessage);
}

function validateTitle(title, message) {
  if (!title || !title.trim()) {
    return {
      isValid: false,
      message,
    };
  }

  return {
    isValid: true,
    title: title.trim(),
  };
}

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

async function validateUserTodoList(listId, userId) {
  const list = await findUserTodoList(listId, userId);

  if (!list) {
    return {
      isValid: false,
      status: 404,
      message: "Lista não encontrada.",
    };
  }

  return {
    isValid: true,
    list,
  };
}

async function runTodoItemAction({
  req,
  res,
  action,
  successMessage,
  notFoundMessage,
  internalLogMessage,
  internalResponseMessage,
}) {
  try {
    const userId = req.user.id;
    const { listId, itemId } = req.params;

    const listValidation = await validateUserTodoList(listId, userId);

    if (!listValidation.isValid) {
      return sendError(res, listValidation.status, listValidation.message);
    }

    const result = await action({ listId, itemId });

    if (result.rows.length === 0) {
      return sendError(res, 404, notFoundMessage);
    }

    return res.status(200).json({
      message: successMessage,
      item: result.rows[0],
    });
  } catch (error) {
    return sendInternalError(
      res,
      error,
      internalLogMessage,
      internalResponseMessage
    );
  }
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
    return sendInternalError(
      res,
      error,
      "List todo lists error:",
      "Erro interno ao listar listas."
    );
  }
});

router.post("/lists", async (req, res) => {
  try {
    const userId = req.user.id;
    const titleValidation = validateTitle(
      req.body.title,
      "Informe o título da lista."
    );

    if (!titleValidation.isValid) {
      return sendError(res, 400, titleValidation.message);
    }

    const result = await pool.query(
      `
        INSERT INTO todo_lists (user_id, title)
        VALUES ($1, $2)
        RETURNING id, title, created_at, updated_at
      `,
      [userId, titleValidation.title]
    );

    return res.status(201).json({
      message: "Lista criada com sucesso.",
      list: {
        ...result.rows[0],
        items: [],
      },
    });
  } catch (error) {
    return sendInternalError(
      res,
      error,
      "Create todo list error:",
      "Erro interno ao criar lista."
    );
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
      return sendError(res, 404, "Lista não encontrada.");
    }

    return res.status(200).json({
      message: "Lista removida com sucesso.",
    });
  } catch (error) {
    return sendInternalError(
      res,
      error,
      "Delete todo list error:",
      "Erro interno ao remover lista."
    );
  }
});

router.post("/lists/:listId/items", async (req, res) => {
  try {
    const userId = req.user.id;
    const { listId } = req.params;
    const titleValidation = validateTitle(
      req.body.title,
      "Informe o nome do item."
    );

    if (!titleValidation.isValid) {
      return sendError(res, 400, titleValidation.message);
    }

    const listValidation = await validateUserTodoList(listId, userId);

    if (!listValidation.isValid) {
      return sendError(res, listValidation.status, listValidation.message);
    }

    const result = await pool.query(
      `
        INSERT INTO todo_items (list_id, title)
        VALUES ($1, $2)
        RETURNING id, title, is_checked, created_at, updated_at
      `,
      [listId, titleValidation.title]
    );

    return res.status(201).json({
      message: "Item adicionado com sucesso.",
      item: result.rows[0],
    });
  } catch (error) {
    return sendInternalError(
      res,
      error,
      "Create todo item error:",
      "Erro interno ao adicionar item."
    );
  }
});

router.patch("/lists/:listId/items/:itemId/toggle", async (req, res) =>
  runTodoItemAction({
    req,
    res,
    successMessage: "Item atualizado com sucesso.",
    notFoundMessage: "Item não encontrado.",
    internalLogMessage: "Toggle todo item error:",
    internalResponseMessage: "Erro interno ao atualizar item.",
    action: ({ listId, itemId }) =>
      pool.query(
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
      ),
  })
);

router.delete("/lists/:listId/items/:itemId", async (req, res) =>
  runTodoItemAction({
    req,
    res,
    successMessage: "Item removido com sucesso.",
    notFoundMessage: "Item não encontrado.",
    internalLogMessage: "Delete todo item error:",
    internalResponseMessage: "Erro interno ao remover item.",
    action: ({ listId, itemId }) =>
      pool.query(
        `
          DELETE FROM todo_items
          WHERE id = $1
            AND list_id = $2
          RETURNING id
        `,
        [itemId, listId]
      ),
  })
);

module.exports = router;