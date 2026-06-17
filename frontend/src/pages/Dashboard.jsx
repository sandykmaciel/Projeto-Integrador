import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const priorityLabels = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

const priorityOrder = {
  high: 3,
  medium: 2,
  low: 1,
};

function getPercentage(value, total) {
  if (!total) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

function formatDateTime(date) {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
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

  const [deadlineSort, setDeadlineSort] = useState("date");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const sortedPriorityTasks = useMemo(() => {
    const tasks = [...(summary.priorityTasks || [])];

    if (deadlineSort === "priority") {
      return tasks.sort((firstTask, secondTask) => {
        const firstPriority =
          firstTask.priority_weight || priorityOrder[firstTask.priority] || 0;
        const secondPriority =
          secondTask.priority_weight || priorityOrder[secondTask.priority] || 0;

        if (secondPriority !== firstPriority) {
          return secondPriority - firstPriority;
        }

        return new Date(firstTask.due_date || 0) - new Date(secondTask.due_date || 0);
      });
    }

    return tasks.sort((firstTask, secondTask) => {
      const firstDate = firstTask.due_date
        ? new Date(firstTask.due_date).getTime()
        : Number.MAX_SAFE_INTEGER;

      const secondDate = secondTask.due_date
        ? new Date(secondTask.due_date).getTime()
        : Number.MAX_SAFE_INTEGER;

      return firstDate - secondDate;
    });
  }, [summary.priorityTasks, deadlineSort]);

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

          <section className="project-details-panel">
            <div className="project-details-panel-header">
              <div>
                <h2>Prioridade de Prazos</h2>
                <p>
                  Tarefas pendentes organizadas por urgência para facilitar a
                  priorização do trabalho.
                </p>
              </div>

              <div className="deadline-sort-group">
                <button
                  type="button"
                  className={
                    deadlineSort === "date" ? "filter-chip active" : "filter-chip"
                  }
                  onClick={() => setDeadlineSort("date")}
                >
                  Ordenar por data
                </button>

                <button
                  type="button"
                  className={
                    deadlineSort === "priority"
                      ? "filter-chip active"
                      : "filter-chip"
                  }
                  onClick={() => setDeadlineSort("priority")}
                >
                  Ordenar por prioridade
                </button>
              </div>
            </div>

            <div className="tasks-table-wrapper">
              <table className="tasks-table dashboard-deadline-table">
                <thead>
                  <tr>
                    <th>Prioridade</th>
                    <th>Nome do Projeto</th>
                    <th>Tarefa</th>
                    <th>Data Inicial</th>
                    <th>Data Final</th>
                  </tr>
                </thead>

                <tbody>
                  {sortedPriorityTasks.length === 0 && (
                    <tr>
                      <td colSpan="5" className="empty-table-cell">
                        Nenhuma tarefa pendente encontrada.
                      </td>
                    </tr>
                  )}

                  {sortedPriorityTasks.map((task) => (
                    <tr key={task.id}>
                      <td>
                        <span className={`task-priority-pill ${task.priority}`}>
                          {priorityLabels[task.priority] || "Média"}
                        </span>
                      </td>

                      <td>
                        <strong>{task.project_title}</strong>
                      </td>

                      <td>{task.task_title}</td>

                      <td>{formatDateTime(task.created_at)}</td>

                      <td>{formatDateTime(task.due_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </section>
  );
}