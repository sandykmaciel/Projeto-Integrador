import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function RecoveryPlaceholder() {
  return (
    <main className="login-page">
      <section className="login-card">
        <div className="brand-logo">✓</div>

        <h1>Recuperar senha</h1>

        <p>
          A recuperação de senha será implementada no próximo PR deste card.
        </p>

        <a href="/login">Voltar para login</a>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/cadastro" />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/recuperar-senha" element={<RecoveryPlaceholder />} />
      </Routes>
    </BrowserRouter>
  );
}