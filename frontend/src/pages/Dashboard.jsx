export default function Dashboard() {
  return (
    <section className="dashboard-screen">
      <div className="dashboard-hero">
        <span className="eyebrow">Dashboard</span>

        <h1>Visão geral</h1>

        <p>
          Acompanhe seus projetos, tarefas e notificações em um painel central.
        </p>
      </div>

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
    </section>
  );
}