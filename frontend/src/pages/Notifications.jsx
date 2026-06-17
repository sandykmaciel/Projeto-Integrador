import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const priorityLabels = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
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

function getRemainingTime(dueDate) {
  if (!dueDate) {
    return "Sem prazo definido";
  }

  const now = new Date();
  const due = new Date(dueDate);
  const diffInMs = due.getTime() - now.getTime();

  if (diffInMs < 0) {
    return "Atrasada";
  }

  const diffInMinutes = Math.ceil(diffInMs / (1000 * 60));

  if (diffInMinutes <= 60) {
    return `vence em ${diffInMinutes} min`;
  }

  const diffInHours = Math.ceil(diffInMinutes / 60);

  if (diffInHours < 24) {
    return `vence em ${diffInHours} horas`;
  }

  const diffInDays = Math.ceil(diffInHours / 24);

  return `vence em ${diffInDays} dias`;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((notification) => !notification.is_read);
    }

    if (filter === "read") {
      return notifications.filter((notification) => notification.is_read);
    }

    return notifications;
  }, [filter, notifications]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications]
  );

  const overdueCount = useMemo(
    () =>
      notifications.filter((notification) => {
        if (!notification.due_date) {
          return false;
        }

        return new Date(notification.due_date) < new Date();
      }).length,
    [notifications]
  );

  async function loadNotifications() {
    try {
      setIsLoading(true);
      setError("");

      const response = await api.get("/notifications");

      setNotifications(response.data.notifications);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Não foi possível carregar as notificações.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMarkAsRead(notificationId) {
    try {
      setIsUpdating(true);
      setError("");
      setFeedback("");

      await api.patch(`/notifications/${notificationId}/read`);

      setFeedback("Notificação marcada como lida.");

      await loadNotifications();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Não foi possível marcar a notificação como lida.";

      setError(message);
    } finally {
      setIsUpdating(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <section className="module-screen">
      <div className="module-header">
        <div>
          <span className="eyebrow">Central global</span>
          <h1>Notificações</h1>
          <p>
            Acompanhe tarefas próximas do vencimento, prioridades e alertas
            importantes gerados automaticamente pelo sistema.
          </p>
        </div>

        <button
          type="button"
          className="secondary-action-button"
          onClick={loadNotifications}
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

      <section className="notifications-summary-grid">
        <article className="project-summary-card">
          <span>Total</span>
          <strong>{notifications.length}</strong>
          <small>Notificações geradas</small>
        </article>

        <article className="project-summary-card">
          <span>Não lidas</span>
          <strong>{unreadCount}</strong>
          <small>Alertas pendentes</small>
        </article>

        <article className="project-summary-card">
          <span>Atrasadas</span>
          <strong>{overdueCount}</strong>
          <small>Tarefas que passaram do prazo</small>
        </article>
      </section>

      <section className="project-details-panel">
        <div className="project-details-panel-header">
          <div>
            <h2>Alertas de prazo</h2>
            <p>
              As notificações são criadas para tarefas não concluídas com data
              final próxima ou atrasada.
            </p>
          </div>

          <div className="notification-filter-group">
            <button
              type="button"
              className={filter === "all" ? "filter-chip active" : "filter-chip"}
              onClick={() => setFilter("all")}
            >
              Todas
            </button>

            <button
              type="button"
              className={
                filter === "unread" ? "filter-chip active" : "filter-chip"
              }
              onClick={() => setFilter("unread")}
            >
              Não lidas
            </button>

            <button
              type="button"
              className={
                filter === "read" ? "filter-chip active" : "filter-chip"
              }
              onClick={() => setFilter("read")}
            >
              Lidas
            </button>
          </div>
        </div>

        <div className="notification-list">
          {isLoading && (
            <div className="empty-state-card">
              <strong>Carregando notificações...</strong>
              <span>Buscando alertas gerados pelo sistema.</span>
            </div>
          )}

          {!isLoading && filteredNotifications.length === 0 && (
            <div className="empty-state-card">
              <strong>Nenhuma notificação encontrada.</strong>
              <span>
                Crie tarefas com vencimento próximo para visualizar alertas
                nesta central.
              </span>
            </div>
          )}

          {!isLoading &&
            filteredNotifications.map((notification) => (
              <article
                key={notification.id}
                className={
                  notification.is_read
                    ? "notification-card read"
                    : "notification-card"
                }
              >
                <div className="notification-card-main">
                  <div className="notification-icon">!</div>

                  <div>
                    <div className="notification-title-row">
                      <h3>{notification.title}</h3>

                      <span
                        className={`task-priority-pill ${notification.priority}`}
                      >
                        {priorityLabels[notification.priority] || "Média"}
                      </span>
                    </div>

                    <p>{notification.message}</p>

                    <div className="notification-meta">
                      <span>{notification.project_title || "Sem projeto"}</span>
                      <span>{notification.task_title || "Sem tarefa"}</span>
                      <span>{getRemainingTime(notification.due_date)}</span>
                      <span>{formatDateTime(notification.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="notification-card-actions">
                  {notification.is_read ? (
                    <span className="read-badge">Lida</span>
                  ) : (
                    <button
                      type="button"
                      className="secondary-action-button"
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={isUpdating}
                    >
                      Marcar como lida
                    </button>
                  )}
                </div>
              </article>
            ))}
        </div>
      </section>
    </section>
  );
}