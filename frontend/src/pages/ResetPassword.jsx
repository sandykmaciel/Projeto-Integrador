import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../services/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setError("");
    setSuccess("");

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function validateForm() {
    if (!token) {
      return "Link de redefinição inválido.";
    }

    if (!formData.password) {
      return "Informe a nova senha.";
    }

    if (!formData.confirmPassword) {
      return "Confirme a nova senha.";
    }

    if (formData.password !== formData.confirmPassword) {
      return "As senhas informadas não conferem.";
    }

    const hasMinimumLength = formData.password.length >= 4;
    const hasUppercaseLetter = /[A-Z]/.test(formData.password);

    if (!hasMinimumLength || !hasUppercaseLetter) {
      return "A senha deve ter no mínimo 4 caracteres e pelo menos uma letra maiúscula.";
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

      const response = await api.post("/auth/reset-password", {
        token,
        password: formData.password,
      });

      setSuccess(response.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1400);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Não foi possível redefinir sua senha.";

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
          <span className="eyebrow">Nova senha</span>

          <h1>Redefinir senha</h1>

          <p>
            Crie uma nova senha para recuperar o acesso à sua conta.
          </p>
        </div>

        <form className="register-form" onSubmit={handleSubmit} noValidate>
          <label>
            Nova senha
            <input
              type="password"
              name="password"
              placeholder="Mínimo 4 caracteres e 1 letra maiúscula"
              value={formData.password}
              onChange={handleChange}
            />
          </label>

          <label>
            Confirmar nova senha
            <input
              type="password"
              name="confirmPassword"
              placeholder="Digite a nova senha novamente"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </label>

          {error && <div className="form-message error">{error}</div>}
          {success && <div className="form-message success">{success}</div>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Redefinindo..." : "Redefinir senha"}
          </button>
        </form>

        <p className="login-link">
          Lembrou sua senha? <a href="/login">Voltar para login</a>
        </p>
      </section>

      <section className="showcase-panel login-showcase-panel">
        <div className="showcase-content">
          <span className="showcase-badge">Conta protegida</span>

          <h2>Escolha uma nova senha para continuar.</h2>

          <p>
            Após redefinir sua senha, você poderá entrar novamente e acessar seu
            painel de tarefas com segurança.
          </p>

          <div className="task-preview">
            <div className="task-preview-header">
              <span>Recomendações</span>
              <strong>Senha segura</strong>
            </div>

            <div className="task-item high">
              <span></span>

              <div>
                <strong>Use letras maiúsculas</strong>
                <small>Exigência mínima da plataforma</small>
              </div>
            </div>

            <div className="task-item medium">
              <span></span>

              <div>
                <strong>Evite senhas óbvias</strong>
                <small>Não use dados fáceis de adivinhar</small>
              </div>
            </div>

            <div className="task-item low">
              <span></span>

              <div>
                <strong>Guarde sua senha</strong>
                <small>Use uma senha que você consiga lembrar</small>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}