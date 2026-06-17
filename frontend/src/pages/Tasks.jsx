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

const sortLabels = {
  alphabetic: "ordem alfabética",
  priority: "prioridade",
  dueDate: "data final",
};

function formatDateTime(date) {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function isTaskCompleted(task) {
  return task.status === "completed";
}

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("dueDate");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const completedCount = useMemo(
    () => tasks.filter((task) => isTaskCompleted(task)).length,
    [tasks]
  );

  const pendingCount = useMemo(
    () => tasks.filter((task) => !isTaskCompleted(task)).length,
    [tasks]
  );

  const filteredAndSortedTasks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filteredTasks = tasks.filter((task) => {
      const taskTitle = task.title?.toLowerCase() || "";
      const projectTitle = task.project_title?.toLowerCase() || "";

      return (
        taskTitle.includes(normalizedSearch) ||
        projectTitle.includes(normalizedSearch)
      );
    });

    return filteredTasks.sort((firstTask, secondTask) => {
      const firstCompletedWeight = isTaskCompleted(firstTask) ? 1 : 0;
      const secondCompletedWeight = isTaskCompleted(secondTask) ? 1 : 0;

      if (firstCompletedWeight !== secondCompletedWeight) {
        return firstCompletedWeight - secondCompletedWeight;
      }

      if (sortBy === "alphabetic") {
        return firstTask.title.localeCompare(secondTask.title);
      }

      if (sortBy === "priority") {
        const firstPriority = priorityOrder[firstTask.priority] || 0;
        const secondPriority = priorityOrder[secondTask.priority] || 0;

        if (secondPriority !== firstPriority) {
          return secondPriority - firstPriority;
        }

        return firstTask.title.localeCompare(secondTask.title);
      }

      const firstDate = firstTask.due_date
        ? new Date(firstTask.due_date).getTime()
        : Number.MAX_SAFE_INTEGER;

      const secondDate = secondTask.due_date
        ? new Date(secondTask.due_date).getTime()
        : Number.MAX_SAFE_INTEGER;

      return firstDate - secondDate;
    });
  }, [tasks, search, sortBy]);

  async function loadMyTasks() {
    try {
      setIsLoading(true);
      setError("");

      const response = await api.get("/tasks/my");

      setTasks(response.data.tasks);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Não foi possível carregar suas tarefas.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleTask(task) {
    try {
      setUpdatingTaskId(task.id);
      setError("");
      setFeedback("");

      await api.patch(`/projects/${task.project_id}/tasks/${task.id}/toggle`);

      setFeedback("Status da tarefa atualizado com sucesso.");

      await loadMyTasks();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Não foi possível atualizar o status da tarefa.";

      setError(message);
    } finally {
      setUpdatingTaskId(null);
    }
  }

  useEffect(() => {
    loadMyTasks();
  }, []);

  return (
    <section className="module-screen">
      <div className="module-header">
        <div>
          <span className="eyebrow">Gestão individual</span>
          <h1>Minhas tarefas</h1>
          <p>
            Acompanhe suas tarefas atribuídas em todos os projetos, atualize o
            status e organize sua rotina por prioridade, prazo ou nome.
          </p>
        </div>

        <button
          type="button"
          className="secondary-action-button"
          onClick={loadMyTasks}
          disabled={isLoading}
        >
          Atualizar
        </button>
      </div>

      {feedback && (
        <div className="feedback-card success">
          <strong>Sucesso</strong>
          <span>{feedback}</span>
        </div>
      )}

      {error && (
        <div className="feedback-card error">
          <strong>Erro</strong>
          <span>{error}</span>
        </div>
      )}

      <section className="dashboard-summary-grid">
        <article className="project-summary-card">
          <span>Total</span>
          <strong>{tasks.length}</strong>
          <small>Tarefas atribuídas a você</small>
        </article>

        <article className="project-summary-card">
          <span>Pendentes</span>
          <strong>{pendingCount}</strong>
          <small>Itens que ainda precisam de ação</small>
        </article>

        <article className="project-summary-card">
          <span>Concluídas</span>
          <strong>{completedCount}</strong>
          <small>Itens finalizados</small>
        </article>
      </section>

      <section className="project-details-panel">
        <div className="project-details-panel-header">
          <div>
            <h2>Lista de tarefas</h2>
            <p>
              Tarefas concluídas permanecem na lista com distinção visual e são
              enviadas para o final.
            </p>
          </div>
        </div>

        <div className="my-tasks-toolbar">
          <label className="project-task-search">
            Buscar tarefa ou projeto
            <input
              type="text"
              placeholder="Digite o nome da tarefa ou do projeto"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <label className="my-tasks-sort">
            Ordenar por
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="dueDate">Data final</option>
              <option value="priority">Prioridade</option>
              <option value="alphabetic">Ordem alfabética</option>
            </select>
          </label>
        </div>

        <div className="tasks-list-helper">
          Exibindo {filteredAndSortedTasks.length} tarefa(s) em{" "}
          {sortLabels[sortBy]}.
        </div>

        <div className="tasks-table-wrapper">
          <table className="tasks-table my-tasks-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Tarefa</th>
                <th>Projeto</th>
                <th>Prioridade</th>
                <th>Data Final</th>
              </tr>
            </thead>

            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan="5" className="empty-table-cell">
                    Carregando suas tarefas...
                  </td>
                </tr>
              )}

              {!isLoading && filteredAndSortedTasks.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-table-cell">
                    Nenhuma tarefa encontrada.
                  </td>
                </tr>
              )}

              {!isLoading &&
                filteredAndSortedTasks.map((task) => {
                  const completed = isTaskCompleted(task);

                  return (
                    <tr
                      key={task.id}
                      className={completed ? "task-row-completed" : ""}
                    >
                      <td>
                        <label className="task-checkbox-wrapper">
                          <input
                            type="checkbox"
                            checked={completed}
                            disabled={updatingTaskId === task.id}
                            onChange={() => handleToggleTask(task)}
                          />
                          <span>{completed ? "Concluída" : "Pendente"}</span>
                        </label>
                      </td>

                      <td>
                        <span className="my-task-title">{task.title}</span>
                      </td>

                      <td>
                        <strong>{task.project_title}</strong>
                      </td>

                      <td>
                        <span className={`task-priority-pill ${task.priority}`}>
                          {priorityLabels[task.priority] || "Média"}
                        </span>
                      </td>

                      <td>{formatDateTime(task.due_date)}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}