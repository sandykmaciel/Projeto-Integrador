import { useEffect, useState } from "react";
import { api } from "../services/api";

function getPercentage(value, total) {
  if (!total) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

function DonutChart({ title, completed, pending, total }) {
  const completedPercentage = getPercentage(completed, total);
  const pendingPercentage = getPercentage(pending, total);

  return (
    <article className="dashboard-chart-card">
      <div className="dashboard-chart-header">
        <div>
          <span className="eyebrow">{title}</span>
          <h2>Completos vs Pendentes</h2>
        </div>

        <strong>{completedPercentage}%</strong>
      </div>

      <div
        className="donut-chart"
        style={{
          background: `conic-gradient(#6f63ff 0% ${completedPercentage}%, #e4e7ec ${completedPercentage}% 100%)`,
        }}
        aria-label={`${title}: ${completed} completos e ${pending} pendentes`}
      >
        <div className="donut-chart-center">
          <strong>{total}</strong>
          <span>Total</span>
        </div>
      </div>

      <div className="dashboard-chart-legend">
        <div>
          <span className="legend-dot completed"></span>
          <strong>{completed}</strong>
          <small>Completos</small>
        </div>

        <div>
          <span className="legend-dot pending"></span>
          <strong>{pending}</strong>
          <small>Pendentes</small>
        </div>
      </div>

      <div className="dashboard-progress-summary">
        <span>Completos: {completedPercentage}%</span>
        <span>Pendentes: {pendingPercentage}%</span>
      </div>
    </article>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState({
    tasksSummary: {
      total: 0,
      completed: 0,
      pending: 0,
    },
    projectsSummary: {
      total: 0,
      completed: 0,
      pending: 0,
    },
    priorityTasks: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboardSummary() {
    try {
      setIsLoading(true);
      setError("");

      const response = await api.get("/dashboard/summary");

      setSummary(response.data);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Não foi possível carregar os dados do dashboard.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardSummary();
  }, []);

  return (
    <section className="module-screen">
      <div className="module-header">
        <div>
          <span className="eyebrow">Visão geral</span>
          <h1>Dashboard</h1>
          <p>
            Acompanhe sua carga de trabalho, progresso das tarefas e andamento
            dos projetos em uma visão consolidada.
          </p>
        </div>

        <button
          type="button"
          className="secondary-action-button"
          onClick={loadDashboardSummary}
          disabled={isLoading}
        >
          Atualizar
        </button>
      </div>

      {error && (
        <div className="feedback-card error">
          <strong>Erro</strong>
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="feedback-card">
          <strong>Carregando dashboard...</strong>
          <span>Buscando indicadores de tarefas e projetos.</span>
        </div>
      ) : (
        <>
          <section className="dashboard-summary-grid">
            <article className="project-summary-card">
              <span>Total de tarefas</span>
              <strong>{summary.tasksSummary?.total || 0}</strong>
              <small>Tarefas acessíveis ao usuário</small>
            </article>

            <article className="project-summary-card">
              <span>Total de projetos</span>
              <strong>{summary.projectsSummary?.total || 0}</strong>
              <small>Projetos acessíveis ao usuário</small>
            </article>

            <article className="project-summary-card">
              <span>Prazos pendentes</span>
              <strong>{summary.priorityTasks?.length || 0}</strong>
              <small>Tarefas pendentes na fila de prioridade</small>
            </article>
          </section>

          <section className="dashboard-charts-grid">
            <DonutChart
              title="Tasks"
              completed={summary.tasksSummary?.completed || 0}
              pending={summary.tasksSummary?.pending || 0}
              total={summary.tasksSummary?.total || 0}
            />

            <DonutChart
              title="Projetos"
              completed={summary.projectsSummary?.completed || 0}
              pending={summary.projectsSummary?.pending || 0}
              total={summary.projectsSummary?.total || 0}
            />
          </section>
        </>
      )}
    </section>
  );
}