import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProjectDetails() {
    try {
      setIsLoading(true);
      setError("");

      const response = await api.get(`/projects/${id}`);

      setProject(response.data.project);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Não foi possível carregar os detalhes do projeto.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProjectDetails();
  }, [id]);

  function getMemberInitial(memberName) {
    return memberName?.charAt(0)?.toUpperCase() || "U";
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

  if (error) {
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
              A tabela detalhada de tarefas será exibida aqui no próximo passo.
            </p>
          </div>

          <button type="button" className="primary-action-button">
            + Nova tarefa
          </button>
        </div>

        <div className="tasks-table-wrapper">
          <table className="tasks-table">
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
              <tr>
                <td colSpan="6" className="empty-table-cell">
                  A listagem de tarefas será implementada no próximo commit.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}