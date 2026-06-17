import { useEffect, useMemo, useState } from "react";

function getStoredUser() {
  const possibleKeys = ["taskflow:user", "user", "auth:user"];

  for (const key of possibleKeys) {
    const storedValue = localStorage.getItem(key);

    if (!storedValue) {
      continue;
    }

    try {
      return JSON.parse(storedValue);
    } catch {
      return null;
    }
  }

  return null;
}

function getUserInitial(name, email) {
  const baseValue = name || email || "Usuário";

  return baseValue.charAt(0).toUpperCase();
}

function getAccountStatus(token) {
  return token ? "Sessão autenticada" : "Sessão não encontrada";
}

export default function ProfileSettings() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    setUser(getStoredUser());
    setToken(localStorage.getItem("taskflow:token") || "");
  }, []);

  const userName = user?.name || "Luiz";
  const userEmail = user?.email || "luiz@email.com";
  const userInitial = useMemo(
    () => getUserInitial(userName, userEmail),
    [userName, userEmail]
  );

  function handleClearFeedback() {
    setFeedback("");
  }

  function handleCopyEmail() {
    navigator.clipboard.writeText(userEmail);
    setFeedback("E-mail copiado para a área de transferência.");
  }

  return (
    <section className="module-screen">
      <div className="module-header">
        <div>
          <span className="eyebrow">Perfil</span>

          <h1>Configurações do perfil</h1>

          <p>
            Consulte suas informações pessoais, dados da conta e preferências
            utilizadas no TaskFlow.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="feedback-card success">
          <strong>Sucesso</strong>
          <span>{feedback}</span>

          <button
            type="button"
            className="feedback-close-button"
            onClick={handleClearFeedback}
          >
            ×
          </button>
        </div>
      )}

      <section className="profile-settings-hero">
        <div className="profile-avatar-large">{userInitial}</div>

        <div>
          <span className="eyebrow">Área autenticada</span>
          <h2>{userName}</h2>
          <p>{userEmail}</p>
        </div>

        <button
          type="button"
          className="secondary-action-button"
          onClick={handleCopyEmail}
        >
          Copiar e-mail
        </button>
      </section>

      <section className="profile-settings-grid">
        <article className="profile-settings-card">
          <div>
            <span className="profile-settings-icon">👤</span>
            <h2>Dados pessoais</h2>
            <p>Informações básicas vinculadas ao usuário autenticado.</p>
          </div>

          <div className="profile-info-list">
            <div>
              <span>Nome</span>
              <strong>{userName}</strong>
            </div>

            <div>
              <span>E-mail</span>
              <strong>{userEmail}</strong>
            </div>
          </div>
        </article>

        <article className="profile-settings-card">
          <div>
            <span className="profile-settings-icon">🔐</span>
            <h2>Conta</h2>
            <p>Status de acesso e autenticação atual da sessão.</p>
          </div>

          <div className="profile-info-list">
            <div>
              <span>Status</span>
              <strong>{getAccountStatus(token)}</strong>
            </div>

            <div>
              <span>Tipo de acesso</span>
              <strong>Usuário autenticado</strong>
            </div>
          </div>
        </article>

        <article className="profile-settings-card">
          <div>
            <span className="profile-settings-icon">⚙️</span>
            <h2>Preferências</h2>
            <p>
              Preferências visuais e de uso da aplicação. O modo escuro será
              configurado nesta área.
            </p>
          </div>

          <div className="profile-info-list">
            <div>
              <span>Tema atual</span>
              <strong>Claro</strong>
            </div>

            <div>
              <span>Idioma</span>
              <strong>Português Brasil</strong>
            </div>
          </div>
        </article>

        <article className="profile-settings-card">
          <div>
            <span className="profile-settings-icon">🛡️</span>
            <h2>Segurança</h2>
            <p>Informações de proteção e boas práticas de acesso.</p>
          </div>

          <div className="profile-security-note">
            <strong>Conta protegida por autenticação</strong>
            <span>
              As páginas internas utilizam token JWT salvo localmente para
              controlar o acesso às rotas protegidas.
            </span>
          </div>
        </article>
      </section>
    </section>
  );
}