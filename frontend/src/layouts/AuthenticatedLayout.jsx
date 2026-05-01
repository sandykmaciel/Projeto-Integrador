import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";

export default function AuthenticatedLayout() {
  const token = localStorage.getItem("taskflow:token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="app-shell">
      <Sidebar />

      <section className="app-content-area">
        <TopNavbar />

        <section className="app-page-content">
          <Outlet />
        </section>
      </section>
    </main>
  );
}