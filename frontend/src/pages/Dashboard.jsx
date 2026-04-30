import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("taskflow:user") || "null");

  function handleLogout() {
    localStorage.removeItem("taskflow:token");
    localStorage.removeItem("taskflow:user");

    navigate("/login");
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div className="brand">
          <div className="brand-logo">✓</div>

          <div>
            <strong>TaskFlow</strong>
            <span>Dashboard</span>
          </div>
        </div>

        <button type="button" onClick={handleLogout}>
          Sair
        </button>
      </header>

      <section className="dashboard-hero">
        <span className="eyebrow">Área do usuário</span>

        <h1>Olá, {user?.name || "usuário"}.</h1>

        <p>
          Login realizado com sucesso. Em breve, este painel exibirá seus
          projetos, tarefas, prazos e notificações.
        </p>
      </section>

      <section className="dashboard-grid">
        <article>
          <strong>0</strong>
          <span>Tarefas pendentes</span>
        </article>

        <article>
          <strong>0</strong>
          <span>Projetos ativos</span>
        </article>

        <article>
          <strong>0</strong>
          <span>Alertas próximos</span>
        </article>
      </section>
    </main>
  );
}