import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Register from "./pages/Register";

function LoginPlaceholder() {
  return (
    <main className="login-page">
      <section className="login-card">
        <div className="brand-logo">✓</div>

        <h1>Login</h1>

        <p>
          Cadastro realizado com sucesso. A tela de login será implementada na
          próxima User Story.
        </p>

        <a href="/cadastro">Voltar para cadastro</a>
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
        <Route path="/login" element={<LoginPlaceholder />} />
      </Routes>
    </BrowserRouter>
  );
}