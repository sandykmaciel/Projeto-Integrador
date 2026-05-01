export default function Notifications() {
  return (
    <section className="module-screen">
      <div className="module-hero">
        <span className="eyebrow">Notificações</span>

        <h1>Notificações</h1>

        <p>
          Acompanhe alertas importantes sobre prazos, tarefas e movimentações da
          sua conta.
        </p>
      </div>

      <section className="module-grid">
        <article>
          <strong>0</strong>
          <span>Não lidas</span>
        </article>

        <article>
          <strong>0</strong>
          <span>Alertas de prazo</span>
        </article>

        <article>
          <strong>0</strong>
          <span>Atualizações</span>
        </article>
      </section>
    </section>
  );
}