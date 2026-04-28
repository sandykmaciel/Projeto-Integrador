import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

function RegisterPlaceholder() {
  return (
    <main className="page">
      <section className="card">
        <div className="logo">✓</div>

        <h1>TaskFlow</h1>

        <h2>Cadastro de usuário</h2>

        <p>
          A estrutura inicial do frontend foi criada. A tela completa de
          cadastro será implementada no próximo PR.
        </p>

        <a href="/login">Ir para login</a>
      </section>
    </main>
  );
}

function LoginPlaceholder() {
  return (
    <main className="page">
      <section className="card">
        <div className="logo">✓</div>

        <h1>TaskFlow</h1>

        <h2>Login</h2>

        <p>
          Esta é uma tela provisória. O login será implementado em uma próxima
          User Story.
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
        <Route path="/cadastro" element={<RegisterPlaceholder />} />
        <Route path="/login" element={<LoginPlaceholder />} />
      </Routes>
    </BrowserRouter>
  );
}