export default function ProfileSettings() {
  return (
    <section className="module-screen">
      <div className="module-hero">
        <span className="eyebrow">Perfil</span>

        <h1>Configurações do perfil</h1>

        <p>
          Gerencie suas informações pessoais, preferências de conta e dados de
          acesso.
        </p>
      </div>

      <section className="module-grid">
        <article>
          <strong>Dados</strong>
          <span>Informações pessoais</span>
        </article>

        <article>
          <strong>Conta</strong>
          <span>Preferências de acesso</span>
        </article>

        <article>
          <strong>Segurança</strong>
          <span>Proteção da conta</span>
        </article>
      </section>
    </section>
  );
}