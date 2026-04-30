const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Informe email e senha.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Email inválido.",
      });
    }

    const userResult = await pool.query(
      `
        SELECT id, name, email, password_hash
        FROM users
        WHERE LOWER(email) = LOWER($1)
      `,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        message: "Email inválido.",
      });
    }

    const user = userResult.rows[0];

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Email ou senha incorretos.",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      message: "Login realizado com sucesso.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Erro interno ao realizar login.",
    });
  }
});

module.exports = router;