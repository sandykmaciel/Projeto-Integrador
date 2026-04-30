import { Navigate, Outlet } from "react-router-dom";

export default function AuthenticatedLayout() {
  const token = localStorage.getItem("taskflow:token");
  const user = JSON.parse(localStorage.getItem("taskflow:user") || "null");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="app-shell">
      <aside className="app-sidebar-placeholder">
        <div className="brand compact-brand">
          <div className="brand-logo">✓</div>

          <div>
            <strong>TaskFlow</strong>
            <span>Menu</span>
          </div>
        </div>
      </aside>

      <section className="app-content-area">
        <header className="app-navbar-placeholder">
          <div>
            <span className="eyebrow">Área autenticada</span>
            <h1>Olá, {user?.name || "usuário"}.</h1>
          </div>

          <div className="user-chip">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
        </header>

        <section className="app-page-content">
          <Outlet />
        </section>
      </section>
    </main>
  );
}