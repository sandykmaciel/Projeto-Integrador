import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";

const priorityLabels = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

const statusLabels = {
  pending: "Pendente",
  in_progress: "Em andamento",
  completed: "Concluída",
};

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskSearch, setTaskSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const filteredTasks = useMemo(() => {
    const search = taskSearch.trim().toLowerCase();

    if (!search) {
      return tasks;
    }

    return tasks.filter((task) => {
      const title = task.title?.toLowerCase() || "";
      const description = task.description?.toLowerCase() || "";
      const responsibleName = task.responsible_name?.toLowerCase() || "";

      return (
        title.includes(search) ||
        description.includes(search) ||
        responsibleName.includes(search)
      );
    });
  }, [taskSearch, tasks]);

  async function loadProjectDetails() {
    try {
      setError("");

      const response = await api.get(`/projects/${id}`);

      setProject(response.data.project);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Não foi possível carregar os detalhes do projeto.";

      setError(message);
    }
  }

  async function loadProjectTasks() {
    try {
      setIsTasksLoading(true);
      setError("");

      const response = await api.get(`/projects/${id}/tasks`);

      setTasks(response.data.tasks);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Não foi possível carregar as tarefas do projeto.";

      setError(message);
    } finally {
      setIsTasksLoading(false);
    }
  }

  async function loadPageData() {
    try {
      setIsLoading(true);

      await Promise.all([loadProjectDetails(), loadProjectTasks()]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPageData();
  }, [id]);

  function getMemberInitial(memberName) {
    return memberName?.charAt(0)?.toUpperCase() || "U";
  }

  function formatDate(date) {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("pt-BR", {
      timeZone: "UTC",
    });
  }

  async function handleToggleTask(taskId) {
    try {
      setIsUpdatingTask(true);
      setError("");
      setFeedback("");

      await api.patch(`/projects/${id}/tasks/${taskId}/toggle`);

      setFeedback("Status da tarefa atualizado com sucesso.");

      await Promise.all([loadProjectDetails(), loadProjectTasks()]);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Não foi possível atualizar o status da tarefa.";

      setError(message);
    } finally {
      setIsUpdatingTask(false);
    }
  }

  if (isLoading) {
    return (
      <section className="module-screen">
        <div className="feedback-card">
          <strong>Carregando projeto...</strong>
          <span>Buscando os dados consolidados desta iniciativa.</span>
        </div>
      </section>
    );
  }

  if (error && !project) {
    return (
      <section className="module-screen">
        <div className="feedback-card error">
          <strong>Erro ao carregar projeto</strong>
          <span>{error}</span>
        </div>

        <button
          type="button"
          className="secondary-action-button project-details-back-button"
          onClick={() => navigate("/projetos")}
        >
          Voltar para projetos
        </button>
      </section>
    );
  }

  return (
    <section className="module-screen">
      <div className="project-details-header">
        <div>
          <Link to="/projetos" className="project-back-link">
            ← Voltar para projetos
          </Link>

          <span className="eyebrow">Detalhes do projeto</span>

          <h1>{project.title}</h1>

          <p>
            {project.description ||
              "Projeto sem descrição cadastrada até o momento."}
          </p>
        </div>

        <div className="project-details-actions">
          <button type="button" className="secondary-action-button">
            Editar projeto
          </button>

          <button type="button" className="danger-action-button">
            Excluir projeto
          </button>
        </div>
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

      <section className="project-details-summary-grid">
        <article className="project-summary-card">
          <span>Total de tarefas</span>
          <strong>{project.total_tasks || 0}</strong>
          <small>Tarefas vinculadas a este projeto</small>
        </article>

        <article className="project-summary-card">
          <span>Concluídas</span>
          <strong>{project.completed_tasks || 0}</strong>
          <small>Tarefas marcadas como concluídas</small>
        </article>

        <article className="project-summary-card">
          <span>Progresso</span>
          <strong>{project.progress || 0}%</strong>
          <small>Atualizado conforme conclusão das tarefas</small>
        </article>
      </section>

      <section className="project-details-panel">
        <div className="project-details-panel-header">
          <div>
            <h2>Progresso do projeto</h2>
            <p>Acompanhe o andamento geral das atividades vinculadas.</p>
          </div>

          <strong>{project.progress || 0}%</strong>
        </div>

        <div className="project-progress-track details-progress-track">
          <div
            className="project-progress-fill"
            style={{ width: `${project.progress || 0}%` }}
          ></div>
        </div>
      </section>

      <section className="project-details-panel">
        <div className="project-details-panel-header">
          <div>
            <h2>Membros do projeto</h2>
            <p>Integrantes vinculados a esta iniciativa.</p>
          </div>
        </div>

        <div className="project-details-members-list">
          {project.members?.map((member) => (
            <div className="project-details-member" key={member.id}>
              <div className="member-avatar">
                {getMemberInitial(member.name)}
              </div>

              <div>
                <strong>{member.name}</strong>
                <span>{member.email}</span>
              </div>

              <small>{member.role === "owner" ? "Dono" : "Membro"}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="project-details-panel">
        <div className="project-details-panel-header">
          <div>
            <h2>Tarefas do projeto</h2>
            <p>
              Visualize o backlog específico deste projeto e atualize o status
              das atividades.
            </p>
          </div>

          <button type="button" className="primary-action-button">
            + Nova tarefa
          </button>
        </div>

        <label className="project-task-search">
          Filtro de busca
          <input
            type="text"
            placeholder="Buscar por tarefa, descrição ou responsável"
            value={taskSearch}
            onChange={(event) => setTaskSearch(event.target.value)}
          />
        </label>

        <div className="tasks-table-wrapper">
          <table className="tasks-table project-details-tasks-table">
            <thead>
              <tr>
                <th>Tarefas</th>
                <th>Descrição</th>
                <th>Prioridade</th>
                <th>Responsável</th>
                <th>Data Final</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {isTasksLoading && (
                <tr>
                  <td colSpan="6" className="empty-table-cell">
                    Carregando tarefas...
                  </td>
                </tr>
              )}

              {!isTasksLoading && filteredTasks.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-table-cell">
                    Nenhuma tarefa encontrada.
                  </td>
                </tr>
              )}

              {!isTasksLoading &&
                filteredTasks.map((task) => {
                  const isCompleted = task.status === "completed";

                  return (
                    <tr
                      key={task.id}
                      className={isCompleted ? "completed-task-row" : ""}
                    >
                      <td>
                        <label className="task-check-label">
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            disabled={isUpdatingTask}
                            onChange={() => handleToggleTask(task.id)}
                          />

                          <span>{task.title}</span>
                        </label>
                      </td>

                      <td>
                        <span className="task-description-cell">
                          {task.description || "Sem descrição"}
                        </span>
                      </td>

                      <td>
                        <span className={`task-priority-pill ${task.priority}`}>
                          {priorityLabels[task.priority] || "Média"}
                        </span>
                      </td>

                      <td>
                        <span className="task-responsible">
                          {task.responsible_name || "Não informado"}
                        </span>
                      </td>

                      <td>{formatDate(task.due_date)}</td>

                      <td>
                        <div className="task-table-actions">
                          <button type="button" title="Editar tarefa">
                            ✎
                          </button>

                          <button type="button" title="Excluir tarefa">
                            ×
                          </button>
                        </div>
                      </td>
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