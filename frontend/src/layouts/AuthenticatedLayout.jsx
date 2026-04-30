import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function AuthenticatedLayout() {
  const token = localStorage.getItem("taskflow:token");
  const user = JSON.parse(localStorage.getItem("taskflow:user") || "null");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="app-shell">
      <Sidebar />

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