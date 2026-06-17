import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

function getCheckedCount(items) {
  return items.filter((item) => item.is_checked).length;
}

export default function TodoList() {
  const [lists, setLists] = useState([]);
  const [newListTitle, setNewListTitle] = useState("");
  const [newItemTitles, setNewItemTitles] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const totalItems = useMemo(
    () => lists.reduce((total, list) => total + list.items.length, 0),
    [lists]
  );

  const checkedItems = useMemo(
    () =>
      lists.reduce(
        (total, list) => total + list.items.filter((item) => item.is_checked).length,
        0
      ),
    [lists]
  );

  async function loadTodoLists() {
    try {
      setIsLoading(true);
      setError("");

      const response = await api.get("/todo/lists");

      setLists(response.data.lists);
    } catch (error) {
      const message =
        error.response?.data?.message || "Não foi possível carregar suas listas.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateList(event) {
    event.preventDefault();

    if (!newListTitle.trim()) {
      setError("Informe o título da lista.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      setFeedback("");

      await api.post("/todo/lists", {
        title: newListTitle.trim(),
      });

      setNewListTitle("");
      setFeedback("Lista criada com sucesso.");

      await loadTodoLists();
    } catch (error) {
      const message =
        error.response?.data?.message || "Não foi possível criar a lista.";

      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteList(listId) {
    const confirmed = window.confirm(
      "Tem certeza que deseja remover esta lista inteira?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      setFeedback("");

      await api.delete(`/todo/lists/${listId}`);

      setFeedback("Lista removida com sucesso.");

      await loadTodoLists();
    } catch (error) {
      const message =
        error.response?.data?.message || "Não foi possível remover a lista.";

      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateItem(event, listId) {
    event.preventDefault();

    const itemTitle = newItemTitles[listId];

    if (!itemTitle || !itemTitle.trim()) {
      setError("Informe o nome do item.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      setFeedback("");

      await api.post(`/todo/lists/${listId}/items`, {
        title: itemTitle.trim(),
      });

      setNewItemTitles((currentTitles) => ({
        ...currentTitles,
        [listId]: "",
      }));

      setFeedback("Item adicionado com sucesso.");

      await loadTodoLists();
    } catch (error) {
      const message =
        error.response?.data?.message || "Não foi possível adicionar o item.";

      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleItem(listId, itemId) {
    try {
      setIsSaving(true);
      setError("");
      setFeedback("");

      await api.patch(`/todo/lists/${listId}/items/${itemId}/toggle`);

      await loadTodoLists();
    } catch (error) {
      const message =
        error.response?.data?.message || "Não foi possível atualizar o item.";

      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteItem(listId, itemId) {
    try {
      setIsSaving(true);
      setError("");
      setFeedback("");

      await api.delete(`/todo/lists/${listId}/items/${itemId}`);

      setFeedback("Item removido com sucesso.");

      await loadTodoLists();
    } catch (error) {
      const message =
        error.response?.data?.message || "Não foi possível remover o item.";

      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  function handleItemTitleChange(listId, value) {
    setNewItemTitles((currentTitles) => ({
      ...currentTitles,
      [listId]: value,
    }));
  }

  useEffect(() => {
    loadTodoLists();
  }, []);

  return (
    <section className="module-screen">
      <div className="module-header">
        <div>
          <span className="eyebrow">Listas rápidas</span>
          <h1>To-do-list</h1>
          <p>
            Crie checklists simples e independentes de projetos para compras,
            rotinas domésticas, lembretes rápidos ou anotações do dia a dia.
          </p>
        </div>

        <button
          type="button"
          className="secondary-action-button"
          onClick={loadTodoLists}
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
          <span>Listas</span>
          <strong>{lists.length}</strong>
          <small>Checklists salvos no seu perfil</small>
        </article>

        <article className="project-summary-card">
          <span>Itens</span>
          <strong>{totalItems}</strong>
          <small>Itens adicionados nas listas</small>
        </article>

        <article className="project-summary-card">
          <span>Marcados</span>
          <strong>{checkedItems}</strong>
          <small>Itens concluídos rapidamente</small>
        </article>
      </section>

      <section className="project-details-panel">
        <div className="project-details-panel-header">
          <div>
            <h2>Criar Nova Lista</h2>
            <p>
              Informe apenas um título. Os itens podem ser adicionados depois
              dentro do card da lista.
            </p>
          </div>
        </div>

        <form className="todo-create-list-form" onSubmit={handleCreateList}>
          <input
            type="text"
            placeholder="Ex: Lista de Compras"
            value={newListTitle}
            onChange={(event) => setNewListTitle(event.target.value)}
          />

          <button type="submit" className="primary-action-button" disabled={isSaving}>
            Adicionar
          </button>
        </form>
      </section>

      <section className="todo-lists-grid">
        {isLoading && (
          <div className="empty-state-card">
            <strong>Carregando listas...</strong>
            <span>Buscando suas listas rápidas salvas.</span>
          </div>
        )}

        {!isLoading && lists.length === 0 && (
          <div className="empty-state-card">
            <strong>Nenhuma lista criada ainda.</strong>
            <span>
              Crie uma lista rápida para compras, rotina doméstica ou lembretes
              simples.
            </span>
          </div>
        )}

        {!isLoading &&
          lists.map((list) => {
            const checkedCount = getCheckedCount(list.items);

            return (
              <article className="todo-list-card" key={list.id}>
                <div className="todo-list-card-header">
                  <div>
                    <h2>{list.title}</h2>
                    <span>
                      {checkedCount}/{list.items.length} item(ns) marcados
                    </span>
                  </div>

                  <button
                    type="button"
                    className="danger-text-button"
                    onClick={() => handleDeleteList(list.id)}
                    disabled={isSaving}
                  >
                    Remover lista
                  </button>
                </div>

                <form
                  className="todo-add-item-form"
                  onSubmit={(event) => handleCreateItem(event, list.id)}
                >
                  <input
                    type="text"
                    placeholder="Novo item"
                    value={newItemTitles[list.id] || ""}
                    onChange={(event) =>
                      handleItemTitleChange(list.id, event.target.value)
                    }
                  />

                  <button
                    type="submit"
                    className="secondary-action-button"
                    disabled={isSaving}
                  >
                    + adicionar
                  </button>
                </form>

                <div className="todo-items-list">
                  {list.items.length === 0 && (
                    <div className="todo-empty-items">
                      Nenhum item adicionado nesta lista.
                    </div>
                  )}

                  {list.items.map((item) => (
                    <div
                      className={
                        item.is_checked ? "todo-item checked" : "todo-item"
                      }
                      key={item.id}
                    >
                      <label>
                        <input
                          type="checkbox"
                          checked={item.is_checked}
                          onChange={() => handleToggleItem(list.id, item.id)}
                          disabled={isSaving}
                        />

                        <span>{item.title}</span>
                      </label>

                      <button
                        type="button"
                        className="todo-remove-item-button"
                        onClick={() => handleDeleteItem(list.id, item.id)}
                        disabled={isSaving}
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
      </section>
    </section>
  );
}