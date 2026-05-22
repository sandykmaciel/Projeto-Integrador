const express = require("express");

const pool = require("../database/connection");
const ensureAuthenticated = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(ensureAuthenticated);

router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const search = req.query.search?.trim() || "";

    if (search.length < 2) {
      return res.status(200).json({
        users: [],
      });
    }

    const result = await pool.query(
      `
        SELECT id, name, email
        FROM users
        WHERE id <> $1
          AND (
            LOWER(name) LIKE LOWER($2)
            OR LOWER(email) LIKE LOWER($2)
          )
        ORDER BY name ASC
        LIMIT 10
      `,
      [userId, `%${search}%`]
    );

    return res.status(200).json({
      users: result.rows,
    });
  } catch (error) {
    console.error("Search users error:", error);

    return res.status(500).json({
      message: "Erro interno ao buscar usuários.",
    });
  }
});

module.exports = router;