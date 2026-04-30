export default function TodoList() {
  return (
    <section className="module-screen">
      <div className="module-hero">
        <span className="eyebrow">To-do-list</span>

        <h1>Lista rápida</h1>

        <p>
          Registre lembretes e pequenas atividades do dia para não perder nada
          importante.
        </p>
      </div>

      <section className="module-grid">
        <article>
          <strong>0</strong>
          <span>Itens de hoje</span>
        </article>

        <article>
          <strong>0</strong>
          <span>Itens atrasados</span>
        </article>

        <article>
          <strong>0</strong>
          <span>Itens concluídos</span>
        </article>
      </section>
    </section>
  );
}