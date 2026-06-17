import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const actionLabels = {
  task_created: "Tarefa criada",
  task_updated: "Tarefa atualizada",
  task_deleted: "Tarefa excluída",
  task_status_changed: "Status alterado",
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

export default function History() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const filteredHistory = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return history;
    }

    return history.filter((item) => {
      const description = item.description?.toLowerCase() || "";
      const responsible = item.responsible_name?.toLowerCase() || "";
      const project = item.project_title?.toLowerCase() || "";
      const task = item.task_title?.toLowerCase() || "";
      const action = actionLabels[item.action]?.toLowerCase() || "";

      return (
        description.includes(normalizedSearch) ||
        responsible.includes(normalizedSearch) ||
        project.includes(normalizedSearch) ||
        task.includes(normalizedSearch) ||
        action.includes(normalizedSearch)
      );
    });
  }, [history, search]);

  async function loadHistory() {
    try {
      setIsLoading(true);
      setError("");

      const response = await api.get("/history");

      setHistory(response.data.history);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Não foi possível carregar o histórico.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <section className="module-screen">
      <div className="module-header">
        <div>
          <span className="eyebrow">Auditoria</span>
          <h1>Histórico</h1>
          <p>
            Visualize uma linha do tempo imutável com alterações feitas nas
            tarefas dos projetos acessíveis ao usuário.
          </p>
        </div>

        <button
          type="button"
          className="secondary-action-button"
          onClick={loadHistory}
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

      <section className="project-details-panel">
        <div className="project-details-panel-header">
          <div>
            <h2>Linha do tempo</h2>
            <p>
              Registros são criados automaticamente e não possuem edição ou
              exclusão pela interface.
            </p>
          </div>
        </div>

        <label className="project-task-search">
          Filtro de busca
          <input
            type="text"
            placeholder="Buscar por responsável, projeto, tarefa ou ação"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <div className="history-timeline">
          {isLoading && (
            <div className="empty-state-card">
              <strong>Carregando histórico...</strong>
              <span>Buscando registros de alterações.</span>
            </div>
          )}

          {!isLoading && filteredHistory.length === 0 && (
            <div className="empty-state-card">
              <strong>Nenhum registro encontrado.</strong>
              <span>
                Altere tarefas dos projetos para gerar eventos no histórico.
              </span>
            </div>
          )}

          {!isLoading &&
            filteredHistory.map((item) => (
              <article className="history-item" key={item.id}>
                <div className="history-marker"></div>

                <div className="history-content">
                  <div className="history-title-row">
                    <span className="history-action-pill">
                      {actionLabels[item.action] || item.action}
                    </span>

                    <time>{formatDateTime(item.created_at)}</time>
                  </div>

                  <h3>{item.description}</h3>

                  <div className="history-meta">
                    <span>
                      Responsável:{" "}
                      <strong>
                        {item.responsible_name || "Usuário removido"}
                      </strong>
                    </span>

                    <span>
                      Projeto: <strong>{item.project_title || "-"}</strong>
                    </span>

                    <span>
                      Tarefa: <strong>{item.task_title || "Removida"}</strong>
                    </span>
                  </div>
                </div>
              </article>
            ))}
        </div>
      </section>
    </section>
  );
}