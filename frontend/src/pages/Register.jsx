import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    acceptedTerms: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setError("");
    setSuccess("");

    setFormData((currentData) => ({
      ...currentData,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function validateForm() {
    if (!formData.name.trim()) {
      return "Informe seu nome.";
    }

    if (!formData.email.trim()) {
      return "Informe seu email.";
    }

    if (!formData.password) {
      return "Informe sua senha.";
    }

    if (!formData.acceptedTerms) {
      return "Você precisa concordar com os Termos de Privacidade.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      return "Informe um email válido.";
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

      await api.post("/auth/register", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        acceptedTerms: formData.acceptedTerms,
      });

      setSuccess("Conta criada com sucesso. Redirecionando para o login...");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      const message =
        error.response?.data?.message || "Não foi possível realizar o cadastro.";

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="register-page">
      <section className="register-card">
        <div className="brand">
          <div className="brand-logo">✓</div>

          <div>
            <strong>TaskFlow</strong>
            <span>Gestão inteligente de tarefas</span>
          </div>
        </div>

        <div className="form-heading">
          <span className="eyebrow">Comece agora</span>

          <h1>Crie sua conta</h1>

          <p>
            Organize projetos, acompanhe prazos e receba alertas sobre tarefas
            importantes.
          </p>
        </div>

        <form className="register-form" onSubmit={handleSubmit} noValidate>
          <label>
            Nome
            <input
              type="text"
              name="name"
              placeholder="Digite seu nome completo"
              value={formData.name}
              onChange={handleChange}
            />
          </label>

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
              placeholder="Mínimo 4 caracteres e 1 letra maiúscula"
              value={formData.password}
              onChange={handleChange}
            />
          </label>

          <label className="terms">
            <input
              type="checkbox"
              name="acceptedTerms"
              checked={formData.acceptedTerms}
              onChange={handleChange}
            />

            <span>
              Concordo com os <strong>Termos de Privacidade</strong>
            </span>
          </label>

          {error && <div className="form-message error">{error}</div>}
          {success && <div className="form-message success">{success}</div>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Criando conta..." : "Cadastrar"}
          </button>
        </form>

        <p className="login-link">
          Já possui uma conta? <a href="/login">Entrar</a>
        </p>
      </section>

      <section className="showcase-panel">
        <div className="showcase-content">
          <span className="showcase-badge">Organização sem complicação</span>

          <h2>Transforme tarefas soltas em planos claros.</h2>

          <p>
            Centralize suas atividades, acompanhe prazos importantes e mantenha
            sua rotina pessoal ou em equipe mais organizada.
          </p>

          <div className="stats-grid">
            <div>
              <strong>Projetos</strong>
              <span>Organize por áreas</span>
            </div>

            <div>
              <strong>Prazos</strong>
              <span>Acompanhe datas</span>
            </div>

            <div>
              <strong>Alertas</strong>
              <span>Evite esquecimentos</span>
            </div>
          </div>

          <div className="task-preview">
            <div className="task-preview-header">
              <span>Resumo de hoje</span>
              <strong>3 tarefas</strong>
            </div>

            <div className="task-item high">
              <span></span>

              <div>
                <strong>Enviar proposta ao cliente</strong>
                <small>Prioridade alta</small>
              </div>
            </div>

            <div className="task-item medium">
              <span></span>

              <div>
                <strong>Reunião de alinhamento</strong>
                <small>Em andamento</small>
              </div>
            </div>

            <div className="task-item low">
              <span></span>

              <div>
                <strong>Organizar agenda da semana</strong>
                <small>Pendente</small>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}