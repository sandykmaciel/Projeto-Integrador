import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProjects() {
    try {
      setIsLoading(true);
      setError("");

      const response = await api.get("/projects");

      setProjects(response.data.projects);
    } catch (error) {
      const message =
        error.response?.data?.message || "Não foi possível carregar os projetos.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  function getMemberInitial(memberName) {
    return memberName?.charAt(0)?.toUpperCase() || "U";
  }

  return (
    <section className="module-screen">
      <div className="module-hero projects-hero">
        <div>
          <span className="eyebrow">Projetos</span>

          <h1>Projetos</h1>

          <p>
            Organize tarefas relacionadas em projetos e acompanhe o progresso de
            cada contexto da sua rotina.
          </p>
        </div>

        <button type="button" className="primary-action-button">
          Novo projeto
        </button>
      </div>

      {isLoading && (
        <div className="feedback-card">
          <strong>Carregando projetos...</strong>
          <span>Buscando seus projetos cadastrados.</span>
        </div>
      )}

      {error && (
        <div className="feedback-card error">
          <strong>Erro ao carregar projetos</strong>
          <span>{error}</span>
        </div>
      )}

      {!isLoading && !error && projects.length === 0 && (
        <div className="empty-projects-card">
          <div className="empty-projects-icon">◇</div>

          <h2>Nenhum projeto criado ainda</h2>

          <p>
            Crie seu primeiro projeto para agrupar tarefas por trabalho,
            faculdade, rotina pessoal ou qualquer outro contexto.
          </p>

          <button type="button" className="primary-action-button">
            Criar primeiro projeto
          </button>
        </div>
      )}

      {!isLoading && !error && projects.length > 0 && (
        <section className="projects-grid">
          {projects.map((project) => (
            <article className="project-card" key={project.id}>
              <div className="project-card-header">
                <div>
                  <span className="project-label">Projeto</span>
                  <h2>{project.title}</h2>
                </div>

                <div className="project-actions">
                  <button type="button" title="Editar projeto">
                    ✎
                  </button>

                  <button type="button" title="Excluir projeto">
                    ×
                  </button>
                </div>
              </div>

              {project.description && (
                <p className="project-description">{project.description}</p>
              )}

              {!project.description && (
                <p className="project-description muted">
                  Sem descrição cadastrada.
                </p>
              )}

              <div className="project-progress-area">
                <div className="project-progress-header">
                  <span>Progresso</span>
                  <strong>{project.progress || 0}%</strong>
                </div>

                <div className="project-progress-track">
                  <div
                    className="project-progress-fill"
                    style={{ width: `${project.progress || 0}%` }}
                  ></div>
                </div>

                <small>
                  {project.completed_tasks || 0} de {project.total_tasks || 0}{" "}
                  tarefas concluídas
                </small>
              </div>

              <div className="project-card-footer">
                <div className="project-members">
                  {project.members?.slice(0, 4).map((member) => (
                    <div
                      className="member-avatar"
                      key={member.id}
                      title={member.name}
                    >
                      {getMemberInitial(member.name)}
                    </div>
                  ))}

                  {project.members?.length > 4 && (
                    <div className="member-avatar extra">
                      +{project.members.length - 4}
                    </div>
                  )}

                  {(!project.members || project.members.length === 0) && (
                    <div className="member-avatar">U</div>
                  )}
                </div>

                <span className="project-members-count">
                  {project.members?.length || 1} membro
                  {(project.members?.length || 1) > 1 ? "s" : ""}
                </span>
              </div>
            </article>
          ))}
        </section>
      )}
    </section>
  );
}