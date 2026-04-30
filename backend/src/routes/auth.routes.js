const crypto = require("crypto");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const pool = require("../database/connection");
const { isValidEmail, isValidPassword } = require("../utils/validators");

const router = express.Router();

const MAX_LOGIN_ATTEMPTS = 5;
const BLOCK_TIME_IN_MINUTES = 15;

async function getLoginAttempt(email) {
  const result = await pool.query(
    `
      SELECT id, email, failed_attempts, blocked_until
      FROM login_attempts
      WHERE LOWER(email) = LOWER($1)
    `,
    [email]
  );

  return result.rows[0];
}

async function isEmailBlocked(email) {
  const loginAttempt = await getLoginAttempt(email);

  if (!loginAttempt || !loginAttempt.blocked_until) {
    return false;
  }

  const blockedUntil = new Date(loginAttempt.blocked_until);
  const now = new Date();

  return blockedUntil > now;
}

async function registerFailedLoginAttempt(email) {
  const loginAttempt = await getLoginAttempt(email);

  if (!loginAttempt) {
    await pool.query(
      `
        INSERT INTO login_attempts (email, failed_attempts, last_attempt_at)
        VALUES ($1, 1, CURRENT_TIMESTAMP)
      `,
      [email]
    );

    return;
  }

  const nextFailedAttempts = loginAttempt.failed_attempts + 1;
  const shouldBlock = nextFailedAttempts >= MAX_LOGIN_ATTEMPTS;

  await pool.query(
    `
      UPDATE login_attempts
      SET
        failed_attempts = $1,
        blocked_until = CASE
          WHEN $2 = true THEN CURRENT_TIMESTAMP + INTERVAL '${BLOCK_TIME_IN_MINUTES} minutes'
          ELSE blocked_until
        END,
        last_attempt_at = CURRENT_TIMESTAMP
      WHERE LOWER(email) = LOWER($3)
    `,
    [nextFailedAttempts, shouldBlock, email]
  );
}

async function clearLoginAttempts(email) {
  await pool.query(
    `
      DELETE FROM login_attempts
      WHERE LOWER(email) = LOWER($1)
    `,
    [email]
  );
}

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

    const normalizedEmail = email.trim().toLowerCase();

    const blocked = await isEmailBlocked(normalizedEmail);

    if (blocked) {
      return res.status(429).json({
        message:
          "Acesso temporariamente bloqueado por excesso de tentativas. Tente novamente mais tarde.",
      });
    }

    const userResult = await pool.query(
      `
        SELECT id, name, email, password_hash
        FROM users
        WHERE LOWER(email) = LOWER($1)
      `,
      [normalizedEmail]
    );

    if (userResult.rows.length === 0) {
      await registerFailedLoginAttempt(normalizedEmail);

      return res.status(401).json({
        message: "Email inválido.",
      });
    }

    const user = userResult.rows[0];

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      await registerFailedLoginAttempt(normalizedEmail);

      return res.status(401).json({
        message: "Email ou senha incorretos.",
      });
    }

    await clearLoginAttempts(normalizedEmail);

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

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Informe seu email.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Email inválido.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const userResult = await pool.query(
      `
        SELECT id, name, email
        FROM users
        WHERE LOWER(email) = LOWER($1)
      `,
      [normalizedEmail]
    );

    if (userResult.rows.length === 0) {
      return res.status(200).json({
        message:
          "Se o email informado estiver cadastrado, enviaremos um link para redefinição de senha.",
      });
    }

    const user = userResult.rows[0];
    const resetToken = crypto.randomBytes(32).toString("hex");

    await pool.query(
      `
        INSERT INTO password_reset_tokens (user_id, token, expires_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '1 hour')
      `,
      [user.id, resetToken]
    );

    const resetLink = `http://localhost:5173/redefinir-senha?token=${resetToken}`;

    console.log("Password reset requested:");
    console.log(`User: ${user.name} <${user.email}>`);
    console.log(`Reset link: ${resetLink}`);

    return res.status(200).json({
      message:
        "Se o email informado estiver cadastrado, enviaremos um link para redefinição de senha.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      message: "Erro interno ao solicitar recuperação de senha.",
    });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Informe o token e a nova senha.",
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        message:
          "A senha deve ter no mínimo 4 caracteres e pelo menos uma letra maiúscula.",
      });
    }

    const tokenResult = await pool.query(
      `
        SELECT
          password_reset_tokens.id,
          password_reset_tokens.user_id,
          password_reset_tokens.expires_at,
          password_reset_tokens.used_at
        FROM password_reset_tokens
        WHERE password_reset_tokens.token = $1
      `,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({
        message: "Link de redefinição inválido.",
      });
    }

    const resetToken = tokenResult.rows[0];

    if (resetToken.used_at) {
      return res.status(400).json({
        message: "Este link de redefinição já foi utilizado.",
      });
    }

    const now = new Date();
    const expiresAt = new Date(resetToken.expires_at);

    if (expiresAt < now) {
      return res.status(400).json({
        message: "Este link de redefinição expirou.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      `
        UPDATE users
        SET password_hash = $1
        WHERE id = $2
      `,
      [passwordHash, resetToken.user_id]
    );

    await pool.query(
      `
        UPDATE password_reset_tokens
        SET used_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `,
      [resetToken.id]
    );

    await pool.query(
      `
        DELETE FROM login_attempts
        WHERE email = (
          SELECT email
          FROM users
          WHERE id = $1
        )
      `,
      [resetToken.user_id]
    );

    return res.status(200).json({
      message: "Senha redefinida com sucesso.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      message: "Erro interno ao redefinir senha.",
    });
  }
});

module.exports = router;