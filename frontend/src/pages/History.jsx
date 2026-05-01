export default function History() {
  return (
    <section className="module-screen">
      <div className="module-hero">
        <span className="eyebrow">Histórico</span>

        <h1>Histórico</h1>

        <p>
          Consulte registros de alterações, acessos e movimentações realizadas
          no sistema.
        </p>
      </div>

      <section className="module-grid">
        <article>
          <strong>0</strong>
          <span>Alterações registradas</span>
        </article>

        <article>
          <strong>0</strong>
          <span>Acessos recentes</span>
        </article>

        <article>
          <strong>0</strong>
          <span>Eventos do sistema</span>
        </article>
      </section>
    </section>
  );
}