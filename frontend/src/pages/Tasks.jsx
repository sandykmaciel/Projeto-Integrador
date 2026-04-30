export default function Tasks() {
  return (
    <section className="module-screen">
      <div className="module-hero">
        <span className="eyebrow">Tasks</span>

        <h1>Tarefas</h1>

        <p>
          Visualize, acompanhe e organize tarefas com prioridade, prazo e status.
        </p>
      </div>

      <section className="module-grid">
        <article>
          <strong>0</strong>
          <span>Pendentes</span>
        </article>

        <article>
          <strong>0</strong>
          <span>Em andamento</span>
        </article>

        <article>
          <strong>0</strong>
          <span>Concluídas</span>
        </article>
      </section>
    </section>
  );
}