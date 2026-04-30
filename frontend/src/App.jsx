import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";

function ResetPasswordPlaceholder() {
  return (
    <main className="login-page">
      <section className="login-card">
        <div className="brand-logo">✓</div>

        <h1>Redefinir senha</h1>

        <p>
          A tela para criar uma nova senha será implementada no próximo PR deste
          card.
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
        <Route path="/recuperar-senha" element={<ForgotPassword />} />
        <Route path="/redefinir-senha" element={<ResetPasswordPlaceholder />} />
      </Routes>
    </BrowserRouter>
  );
}