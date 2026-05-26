import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const priorityLabels = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

export default function Projects() {
  const currentUser = JSON.parse(localStorage.getItem("taskflow:user") || "null");
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const [selectedMembers, setSelectedMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberSearchResults, setMemberSearchResults] = useState([]);
  const [isSearchingMembers, setIsSearchingMembers] = useState(false);
  const [createModalError, setCreateModalError] = useState("");

  const [createForm, setCreateForm] = useState({
    projectTitle: "",
    projectDescription: "",
    taskTitle: "",
    taskDescription: "",
    taskDueDate: "",
    taskPriority: "medium",
    taskResponsibleId: "",
    taskSearch: "",
  });

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
  });

  const initialTaskPreview = useMemo(() => {
    if (!createForm.taskTitle.trim()) {
      return [];
    }

    const responsible = selectedMembers.find(
      (member) => member.id === createForm.taskResponsibleId
    );

    return [
      {
        id: "initial-task-preview",
        title: createForm.taskTitle.trim(),
        status: "Pendente",
        priority: createForm.taskPriority,
        dueDate: createForm.taskDueDate,
        responsibleName: responsible?.name || "Usuário logado",
      },
    ];
  }, [
    createForm.taskTitle,
    createForm.taskPriority,
    createForm.taskDueDate,
    createForm.taskResponsibleId,
    selectedMembers,
  ]);

  const filteredInitialTasks = useMemo(() => {
    const search = createForm.taskSearch.trim().toLowerCase();

    if (!search) {
      return initialTaskPreview;
    }

    return initialTaskPreview.filter((task) =>
      task.title.toLowerCase().includes(search)
    );
  }, [createForm.taskSearch, initialTaskPreview]);

  function getTodayInputValue() {
    return new Date().toISOString().split("T")[0];
  }

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

  useEffect(() => {
    if (!isCreateModalOpen || memberSearch.trim().length < 2) {
      setMemberSearchResults([]);
      return;
    }

    let shouldIgnoreResponse = false;

    async function searchMembers() {
      try {
        setIsSearchingMembers(true);

        const response = await api.get("/users", {
          params: {
            search: memberSearch.trim(),
          },
        });

        if (shouldIgnoreResponse) {
          return;
        }

        const selectedMemberIds = selectedMembers.map((member) => member.id);

        const availableUsers = response.data.users.filter(
          (user) => !selectedMemberIds.includes(user.id)
        );

        setMemberSearchResults(availableUsers);
      } catch (error) {
        if (!shouldIgnoreResponse) {
          setMemberSearchResults([]);
        }
      } finally {
        if (!shouldIgnoreResponse) {
          setIsSearchingMembers(false);
        }
      }
    }

    const timeoutId = setTimeout(searchMembers, 350);

    return () => {
      shouldIgnoreResponse = true;
      clearTimeout(timeoutId);
    };
  }, [isCreateModalOpen, memberSearch, selectedMembers]);

  function getMemberInitial(memberName) {
    return memberName?.charAt(0)?.toUpperCase() || "U";
  }

  function getDefaultMembers() {
    if (!currentUser?.id) {
      return [];
    }

    return [
      {
        id: currentUser.id,
        name: currentUser.name || "Usuário logado",
        email: currentUser.email || "",
        role: "owner",
      },
    ];
  }

  function resetCreateForm() {
    setCreateForm({
      projectTitle: "",
      projectDescription: "",
      taskTitle: "",
      taskDescription: "",
      taskDueDate: "",
      taskPriority: "medium",
      taskResponsibleId: "",
      taskSearch: "",
    });
  }

  function openCreateModal() {
    const defaultMembers = getDefaultMembers();

    setFeedback("");
    setError("");
    setCreateModalError("");
    setMemberSearch("");
    setMemberSearchResults([]);
    setSelectedMembers(defaultMembers);
    setCreateForm({
      projectTitle: "",
      projectDescription: "",
      taskTitle: "",
      taskDescription: "",
      taskDueDate: "",
      taskPriority: "medium",
      taskResponsibleId: defaultMembers[0]?.id || "",
      taskSearch: "",
    });
    setIsCreateModalOpen(true);
  }
  function closeCreateModal() {
    setIsCreateModalOpen(false);
    setMemberSearch("");
    setMemberSearchResults([]);
    setSelectedMembers([]);
    resetCreateForm();
    setCreateModalError("");
  }

  function handleCreateFormChange(event) {
    const { name, value } = event.target;

    setCreateForm((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function addMember(member) {
    setSelectedMembers((currentMembers) => {
      const memberAlreadySelected = currentMembers.some(
        (currentMember) => currentMember.id === member.id
      );

      if (memberAlreadySelected) {
        return currentMembers;
      }

      return [...currentMembers, member];
    });

    setMemberSearch("");
    setMemberSearchResults([]);
  }

  function removeMember(memberId) {
    if (memberId === currentUser?.id) {
      return;
    }

    setSelectedMembers((currentMembers) =>
      currentMembers.filter((member) => member.id !== memberId)
    );

    if (createForm.taskResponsibleId === memberId) {
      setCreateForm((currentData) => ({
        ...currentData,
        taskResponsibleId: currentUser?.id || "",
      }));
    }
  }

  function validateCreateForm() {
    if (!createForm.projectTitle.trim()) {
      return "Informe o nome do projeto.";
    }

    if (!createForm.taskTitle.trim()) {
      return "Informe o título da tarefa inicial.";
    }

    if (!createForm.taskDueDate) {
      return "Informe a data final da tarefa inicial.";
    }

    if (createForm.taskDueDate < getTodayInputValue()) {
      return "A data final da tarefa não pode ser anterior à data atual.";
    }

    if (!createForm.taskResponsibleId) {
      return "Informe o responsável pela tarefa inicial.";
    }

    return "";
  }

  async function handleCreateProject() {
    const validationError = validateCreateForm();

    if (validationError) {
      setCreateModalError(validationError);
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      setFeedback("");

      const memberIds = selectedMembers
        .filter((member) => member.id !== currentUser?.id)
        .map((member) => member.id);

      await api.post("/projects/with-initial-task", {
        project: {
          title: createForm.projectTitle.trim(),
          description: createForm.projectDescription.trim(),
          memberIds,
        },
        task: {
          title: createForm.taskTitle.trim(),
          description: createForm.taskDescription.trim(),
          dueDate: createForm.taskDueDate,
          priority: createForm.taskPriority,
          assignedUserId: createForm.taskResponsibleId,
        },
      });

      setFeedback("Projeto e tarefa inicial criados com sucesso.");
      closeCreateModal();
      await loadProjects();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Não foi possível criar o projeto com tarefa inicial.";

      setCreateModalError(message);
    } finally {
      setIsSaving(false);
    }
  }

  function openEditModal(project) {
    setFeedback("");
    setError("");
    setEditingProject(project);
    setEditForm({
      title: project.title || "",
      description: project.description || "",
    });
  }

  function closeEditModal() {
    setEditingProject(null);
    setEditForm({
      title: "",
      description: "",
    });
  }

  function handleEditFormChange(event) {
    const { name, value } = event.target;

    setEditForm((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function handleUpdateProject(event) {
    event.preventDefault();

    if (!editForm.title.trim()) {
      setError("Informe o título do projeto.");
      return;
    }

    try {
      setIsSaving(true);
      setCreateModalError("");
      setFeedback("");

      await api.put(`/projects/${editingProject.id}`, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
      });

      setFeedback("Projeto atualizado com sucesso.");
      closeEditModal();
      await loadProjects();
    } catch (error) {
      const message =
        error.response?.data?.message || "Não foi possível atualizar o projeto.";

      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  function openDeleteModal(project) {
    setFeedback("");
    setError("");
    setProjectToDelete(project);
  }

  function closeDeleteModal() {
    setProjectToDelete(null);
  }

  async function handleDeleteProject() {
    try {
      setIsSaving(true);
      setError("");
      setFeedback("");

      await api.delete(`/projects/${projectToDelete.id}`);

      setFeedback("Projeto excluído com sucesso.");
      closeDeleteModal();
      await loadProjects();
    } catch (error) {
      const message =
        error.response?.data?.message || "Não foi possível excluir o projeto.";

      setError(message);
    } finally {
      setIsSaving(false);
    }
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

        <button
          type="button"
          className="primary-action-button"
          onClick={openCreateModal}
        >
          + Novo projeto
        </button>
      </div>

      {feedback && (
        <div className="feedback-card success">
          <strong>Sucesso</strong>
          <span>{feedback}</span>
        </div>
      )}

      {isLoading && (
        <div className="feedback-card">
          <strong>Carregando projetos...</strong>
          <span>Buscando seus projetos cadastrados.</span>
        </div>
      )}

      {error && (
        <div className="feedback-card error">
          <strong>Erro</strong>
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

          <button
            type="button"
            className="primary-action-button"
            onClick={openCreateModal}
          >
            Criar primeiro projeto
          </button>
        </div>
      )}

      {!isLoading && projects.length > 0 && (
        <section className="projects-grid">
          {projects.map((project) => (
            <article
              className="project-card clickable-project-card"
              key={project.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/projetos/${project.id}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  navigate(`/projetos/${project.id}`);
                }
              }}
            >
              <div className="project-card-header">
                <div>
                  <span className="project-label">Projeto</span>
                  <h2>{project.title}</h2>
                </div>

                <div className="project-actions">
                  <button
                    type="button"
                    title="Editar projeto"
                    onClick={(event) => {
                      event.stopPropagation();
                      openEditModal(project);
                    }}
                  >
                    ✎
                  </button>

                  <button
                    type="button"
                    title="Excluir projeto"
                    onClick={(event) => {
                      event.stopPropagation();
                      openDeleteModal(project);
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>

              {project.description ? (
                <p className="project-description">{project.description}</p>
              ) : (
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

      {isCreateModalOpen && (
        <div className="modal-backdrop">
          <section className="project-modal large-project-modal">
            <div className="modal-header">
              <div>
                <span className="eyebrow">Novo projeto</span>
                <h2>Criar projeto e tarefa inicial</h2>
              </div>

              <button type="button" onClick={closeCreateModal}>
                ×
              </button>
            </div>

            {createModalError && (
              <div className="feedback-card error modal-feedback">
                <strong>Erro</strong>
                <span>{createModalError}</span>
              </div>
            )}

            <div className="project-creation-layout">
              <div className="project-creation-column">
                <section className="creation-section">
                  <h3>Dados do projeto</h3>

                  <label>
                    Nome do Projeto
                    <input
                      type="text"
                      name="projectTitle"
                      placeholder="Ex.: Faculdade"
                      value={createForm.projectTitle}
                      onChange={handleCreateFormChange}
                    />
                  </label>

                  <label>
                    Descrição do Projeto
                    <textarea
                      name="projectDescription"
                      placeholder="Descreva o objetivo do projeto"
                      value={createForm.projectDescription}
                      onChange={handleCreateFormChange}
                    />
                  </label>

                  <label>
                    Membros
                    <input
                      type="text"
                      placeholder="Digite nome ou email de um colega"
                      value={memberSearch}
                      onChange={(event) => setMemberSearch(event.target.value)}
                    />
                  </label>

                  {isSearchingMembers && (
                    <div className="member-search-status">
                      Buscando usuários...
                    </div>
                  )}

                  {memberSearchResults.length > 0 && (
                    <div className="member-search-results">
                      {memberSearchResults.map((member) => (
                        <button
                          type="button"
                          className="member-search-option"
                          key={member.id}
                          onClick={() => addMember(member)}
                        >
                          <div className="member-avatar">
                            {getMemberInitial(member.name)}
                          </div>

                          <div>
                            <strong>{member.name}</strong>
                            <span>{member.email}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {memberSearch.trim().length >= 2 &&
                    !isSearchingMembers &&
                    memberSearchResults.length === 0 && (
                      <div className="member-search-status">
                        Nenhum usuário encontrado.
                      </div>
                    )}

                  <div className="selected-members-list">
                    {selectedMembers.map((member) => (
                      <div className="selected-member-pill" key={member.id}>
                        <div className="member-avatar">
                          {getMemberInitial(member.name)}
                        </div>

                        <div>
                          <strong>{member.name}</strong>
                          <span>
                            {member.id === currentUser?.id
                              ? "Você"
                              : member.email}
                          </span>
                        </div>

                        {member.id !== currentUser?.id && (
                          <button
                            type="button"
                            onClick={() => removeMember(member.id)}
                            title="Remover membro"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                <section className="creation-section">
                  <h3>Criar tarefa inicial</h3>

                  <label>
                    Título
                    <input
                      type="text"
                      name="taskTitle"
                      placeholder="Ex.: Entregar relatório"
                      value={createForm.taskTitle}
                      onChange={handleCreateFormChange}
                    />
                  </label>

                  <label>
                    Descrição
                    <textarea
                      name="taskDescription"
                      placeholder="Descreva a primeira atividade do projeto"
                      value={createForm.taskDescription}
                      onChange={handleCreateFormChange}
                    />
                  </label>

                  <div className="form-row">
                    <label>
                      Data Final
                      <input
                        type="date"
                        name="taskDueDate"
                        min={getTodayInputValue()}
                        value={createForm.taskDueDate}
                        onChange={handleCreateFormChange}
                      />
                    </label>

                    <label>
                      Responsável
                      <select
                        name="taskResponsibleId"
                        value={createForm.taskResponsibleId}
                        onChange={handleCreateFormChange}
                      >
                        {selectedMembers.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label>
                    Prioridade
                    <select
                      name="taskPriority"
                      value={createForm.taskPriority}
                      onChange={handleCreateFormChange}
                    >
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                      <option value="low">Baixa</option>
                    </select>
                  </label>
                </section>
              </div>

              <section className="tasks-preview-section">
                <div className="tasks-preview-header">
                  <div>
                    <h3>Minhas Tarefas</h3>
                    <p>
                      A tarefa inicial aparece abaixo enquanto você preenche o
                      formulário.
                    </p>
                  </div>
                </div>

                <label>
                  Filtro de busca
                  <input
                    type="text"
                    name="taskSearch"
                    placeholder="Buscar tarefa pelo nome"
                    value={createForm.taskSearch}
                    onChange={handleCreateFormChange}
                  />
                </label>

                <div className="tasks-table-wrapper">
                  <table className="tasks-table">
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Status</th>
                        <th>Data Final</th>
                        <th>Prioridade</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredInitialTasks.length === 0 && (
                        <tr>
                          <td colSpan="4" className="empty-table-cell">
                            Nenhuma tarefa encontrada.
                          </td>
                        </tr>
                      )}

                      {filteredInitialTasks.map((task) => (
                        <tr key={task.id}>
                          <td>
                            <strong>{task.title}</strong>
                            <span className="task-responsible">
                              {task.responsibleName}
                            </span>
                          </td>
                          <td>
                            <span className="task-status-pill">
                              {task.status}
                            </span>
                          </td>
                          <td>{task.dueDate || "-"}</td>
                          <td>
                            <span
                              className={`task-priority-pill ${task.priority}`}
                            >
                              {priorityLabels[task.priority]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-action-button"
                onClick={closeCreateModal}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="primary-action-button"
                onClick={handleCreateProject}
                disabled={isSaving}
              >
                {isSaving ? "Criando..." : "Criar projeto"}
              </button>
            </div>
          </section>
        </div>
      )}

      {editingProject && (
        <div className="modal-backdrop">
          <section className="project-modal">
            <div className="modal-header">
              <div>
                <span className="eyebrow">Editar projeto</span>
                <h2>Atualizar informações</h2>
              </div>

              <button type="button" onClick={closeEditModal}>
                ×
              </button>
            </div>

            <form className="project-form" onSubmit={handleUpdateProject}>
              <label>
                Título do projeto
                <input
                  type="text"
                  name="title"
                  placeholder="Ex.: Faculdade"
                  value={editForm.title}
                  onChange={handleEditFormChange}
                />
              </label>

              <label>
                Descrição
                <textarea
                  name="description"
                  placeholder="Descreva o objetivo do projeto"
                  value={editForm.description}
                  onChange={handleEditFormChange}
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-action-button"
                  onClick={closeEditModal}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="primary-action-button"
                  disabled={isSaving}
                >
                  {isSaving ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {projectToDelete && (
        <div className="modal-backdrop">
          <section className="project-modal danger-modal">
            <div className="modal-header">
              <div>
                <span className="eyebrow">Excluir projeto</span>
                <h2>Confirmar exclusão</h2>
              </div>

              <button type="button" onClick={closeDeleteModal}>
                ×
              </button>
            </div>

            <p>
              Tem certeza que deseja excluir o projeto{" "}
              <strong>{projectToDelete.title}</strong>?
            </p>

            <div className="delete-warning">
              Todas as tarefas vinculadas a este projeto também serão removidas.
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-action-button"
                onClick={closeDeleteModal}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="danger-action-button"
                onClick={handleDeleteProject}
                disabled={isSaving}
              >
                {isSaving ? "Excluindo..." : "Excluir projeto"}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}