import { NavLink } from "react-router-dom";

const navigationItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: "▦",
  },
  {
    label: "Projetos",
    path: "/projetos",
    icon: "◇",
  },
  {
    label: "Tasks",
    path: "/tasks",
    icon: "✓",
  },
  {
    label: "To-do-list",
    path: "/todo-list",
    icon: "☰",
  },
];

export default function Sidebar() {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        <div className="brand compact-brand">
          <div className="brand-logo">✓</div>

          <div>
            <strong>TaskFlow</strong>
            <span>Workspace</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Navegação principal">
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span>Organize sua rotina</span>
        <strong>com clareza.</strong>
      </div>
    </aside>
  );
}