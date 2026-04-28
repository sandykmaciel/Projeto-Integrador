const express = require("express");
const bcrypt = require("bcryptjs");

const pool = require("../database/connection");
const { isValidEmail, isValidPassword } = require("../utils/validators");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, acceptedTerms } = req.body;

    if (!name || !email || !password || acceptedTerms !== true) {
      return res.status(400).json({
        message: "Preencha todos os campos obrigatórios e aceite os termos.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Informe um email válido.",
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        message:
          "A senha deve ter no mínimo 4 caracteres e pelo menos uma letra maiúscula.",
      });
    }

    const emailAlreadyExists = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = LOWER($1)",
      [email]
    );

    if (emailAlreadyExists.rows.length > 0) {
      return res.status(409).json({
        message: "Este email já está cadastrado.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
        INSERT INTO users (name, email, password_hash, accepted_terms)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, created_at
      `,
      [name, email, passwordHash, acceptedTerms]
    );

    return res.status(201).json({
      message: "Usuário cadastrado com sucesso.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      message: "Erro interno ao realizar cadastro.",
    });
  }
});

module.exports = router;