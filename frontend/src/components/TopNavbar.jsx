import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function TopNavbar() {
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("taskflow:user") || "null");

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "U";
  const userName = user?.name || "Usuário";
  const userEmail = user?.email || "usuario@email.com";

  function handleToggleProfileMenu() {
    setIsProfileMenuOpen((currentValue) => !currentValue);
  }

  function handleLogout() {
    localStorage.removeItem("taskflow:token");
    localStorage.removeItem("taskflow:user");

    navigate("/login");
  }

  return (
    <header className="top-navbar">
      <div className="top-navbar-content">
        <div>
          <span className="eyebrow">Área autenticada</span>
          <h1>Olá, {userName}.</h1>
        </div>

        <div className="profile-menu-wrapper">
          <button
            type="button"
            className="profile-menu-button"
            onClick={handleToggleProfileMenu}
            aria-expanded={isProfileMenuOpen}
            aria-label="Abrir menu de perfil"
          >
            <div className="user-chip">{userInitial}</div>

            <div className="profile-button-text">
              <strong>{userName}</strong>
              <span>{userEmail}</span>
            </div>

            <span className="profile-menu-arrow">
              {isProfileMenuOpen ? "⌃" : "⌄"}
            </span>
          </button>

          {isProfileMenuOpen && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-header">
                <div className="user-chip small">{userInitial}</div>

                <div>
                  <strong>{userName}</strong>
                  <span>{userEmail}</span>
                </div>
              </div>

              <nav className="profile-dropdown-nav">
                <Link
                  to="/perfil"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  Configurações do perfil
                </Link>

                <Link
                  to="/notificacoes"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  Notificações
                </Link>

                <Link
                  to="/historico"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  Histórico
                </Link>

                <button type="button" onClick={handleLogout}>
                  Logout
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}