import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setError("");

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function validateForm() {
    if (!formData.email.trim()) {
      return "Informe seu email.";
    }

    if (!formData.password) {
      return "Informe sua senha.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      return "Email inválido.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await api.post("/auth/login", {
        email: formData.email.trim(),
        password: formData.password,
      });

      localStorage.setItem("taskflow:token", response.data.token);
      localStorage.setItem("taskflow:user", JSON.stringify(response.data.user));

      navigate("/dashboard");
    } catch (error) {
      const message =
        error.response?.data?.message || "Não foi possível realizar login.";

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
          <span className="eyebrow">Bem-vindo de volta</span>

          <h1>Entrar na conta</h1>

          <p>
            Acesse sua área para acompanhar projetos, tarefas e prazos
            importantes.
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
              value={formData.email}
              onChange={handleChange}
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              name="password"
              placeholder="Digite sua senha"
              value={formData.password}
              onChange={handleChange}
            />
          </label>

          <div className="forgot-password-row">
            <a href="/recuperar-senha">Esqueci minha senha</a>
          </div>

          {error && <div className="form-message error">{error}</div>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="login-link">
          Ainda não possui conta? <a href="/cadastro">Criar conta</a>
        </p>
      </section>

      <section className="showcase-panel login-showcase-panel">
        <div className="showcase-content">
          <span className="showcase-badge">Mais clareza no dia a dia</span>

          <h2>Acompanhe tudo que precisa ser feito.</h2>

          <p>
            Entre para visualizar suas atividades, organizar prioridades e manter
            seus compromissos sob controle.
          </p>

          <div className="task-preview">
            <div className="task-preview-header">
              <span>Próximos prazos</span>
              <strong>Hoje</strong>
            </div>

            <div className="task-item high">
              <span></span>

              <div>
                <strong>Responder orçamento</strong>
                <small>Vence às 14:00</small>
              </div>
            </div>

            <div className="task-item medium">
              <span></span>

              <div>
                <strong>Revisar tarefas da equipe</strong>
                <small>Vence às 17:30</small>
              </div>
            </div>

            <div className="task-item low">
              <span></span>

              <div>
                <strong>Planejar próxima semana</strong>
                <small>Sem urgência</small>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}