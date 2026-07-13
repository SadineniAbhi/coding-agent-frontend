import type { Project } from '../api'
import './Sidebar.css'

type SidebarProps = {
  projects: Project[]
  loading: boolean
  error: string | null
  selectedProjectId: string | null
  onSelectProject: (project: Project) => void
  onNewProject: () => void
  collapsed: boolean
  onToggleCollapsed: () => void
}

function ChevronIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      style={{ transform: collapsed ? 'rotate(180deg)' : 'none' }}
    >
      <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export default function Sidebar({
  projects,
  loading,
  error,
  selectedProjectId,
  onSelectProject,
  onNewProject,
  collapsed,
  onToggleCollapsed,
}: SidebarProps) {
  return (
    <aside className={collapsed ? 'sidebar sidebar-collapsed' : 'sidebar'}>
      <div className="sidebar-top">
        {!collapsed && <div className="sidebar-heading">Projects</div>}
        <div className="sidebar-top-actions">
          {!collapsed && (
            <button className="sidebar-icon-btn" onClick={onNewProject} aria-label="New project">
              <PlusIcon />
            </button>
          )}
          <button
            className="sidebar-icon-btn"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? 'Expand projects' : 'Collapse projects'}
          >
            <ChevronIcon collapsed={collapsed} />
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          {loading && <div className="sidebar-empty">Loading…</div>}
          {error && <div className="sidebar-error">{error}</div>}
          {!loading && !error && projects.length === 0 && (
            <div className="sidebar-empty">No projects yet</div>
          )}

          <ul className="sidebar-list">
            {projects.map((project) => (
              <li key={project.project_id}>
                <button
                  className={
                    project.project_id === selectedProjectId
                      ? 'sidebar-item sidebar-item-active'
                      : 'sidebar-item'
                  }
                  onClick={() => onSelectProject(project)}
                >
                  {project.name}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </aside>
  )
}
