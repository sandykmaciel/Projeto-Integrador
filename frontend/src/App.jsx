import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import TodoList from "./pages/TodoList";
import ProfileSettings from "./pages/ProfileSettings";
import Notifications from "./pages/Notifications";
import History from "./pages/History";
import AuthenticatedLayout from "./layouts/AuthenticatedLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/cadastro" />} />

        <Route path="/cadastro" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar-senha" element={<ForgotPassword />} />
        <Route path="/redefinir-senha" element={<ResetPassword />} />

        <Route element={<AuthenticatedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/projetos" element={<Projects />} />
          <Route path="/projects" element={<Navigate to="/projetos" replace />} />

          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tarefas" element={<Navigate to="/tasks" replace />} />

          <Route path="/todo-list" element={<TodoList />} />
          <Route path="/todos" element={<Navigate to="/todo-list" replace />} />

          <Route path="/perfil" element={<ProfileSettings />} />
          <Route path="/profile" element={<Navigate to="/perfil" replace />} />

          <Route path="/notificacoes" element={<Notifications />} />
          <Route path="/notifications" element={<Navigate to="/notificacoes" replace />} />

          <Route path="/historico" element={<History />} />
          <Route path="/history" element={<Navigate to="/historico" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}