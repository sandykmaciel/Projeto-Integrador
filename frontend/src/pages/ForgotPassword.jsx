import { useState } from "react";
import { api } from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    setEmail(event.target.value);
    setError("");
    setSuccess("");
  }

  function validateForm() {
    if (!email.trim()) {
      return "Informe seu email.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return "Email inválido.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await api.post("/auth/forgot-password", {
        email: email.trim(),
      });

      setSuccess(response.data.message);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Não foi possível solicitar a recuperação de senha.";

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card login-auth-card">
        <div className="brand">
          <div className="brand-logo">✓</div>

          <div>
            <strong>TaskFlow</strong>
            <span>Gestão inteligente de tarefas</span>
          </div>
        </div>

        <div className="form-heading">
          <span className="eyebrow">Recuperação de acesso</span>

          <h1>Esqueceu sua senha?</h1>

          <p>
            Informe o email cadastrado na sua conta para receber um link de
            redefinição de senha.
          </p>
        </div>

        <form className="register-form" onSubmit={handleSubmit} noValidate>
          <label>
            Email
            <input
              type="text"
              inputMode="email"
              name="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={handleChange}
            />
          </label>

          {error && <div className="form-message error">{error}</div>}
          {success && <div className="form-message success">{success}</div>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar link de recuperação"}
          </button>
        </form>

        <p className="login-link">
          Lembrou sua senha? <a href="/login">Voltar para login</a>
        </p>
      </section>

      <section className="showcase-panel login-showcase-panel">
        <div className="showcase-content">
          <span className="showcase-badge">Acesso seguro</span>

          <h2>Recupere sua conta com praticidade.</h2>

          <p>
            Enviaremos as instruções para redefinir sua senha de forma segura e
            continuar acompanhando suas tarefas.
          </p>

          <div className="task-preview">
            <div className="task-preview-header">
              <span>Etapas de recuperação</span>
              <strong>3 passos</strong>
            </div>

            <div className="task-item high">
              <span></span>

              <div>
                <strong>Informe seu email</strong>
                <small>Use o email cadastrado</small>
              </div>
            </div>

            <div className="task-item medium">
              <span></span>

              <div>
                <strong>Acesse o link recebido</strong>
                <small>O link expira por segurança</small>
              </div>
            </div>

            <div className="task-item low">
              <span></span>

              <div>
                <strong>Crie uma nova senha</strong>
                <small>Depois é só entrar novamente</small>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}