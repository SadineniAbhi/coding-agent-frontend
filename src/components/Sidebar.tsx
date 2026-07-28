import { useState } from 'react'
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
  userName: string
  userPicture?: string
  onLogout: () => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

function BrandMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 28 28" aria-hidden="true">
      <rect width="28" height="28" rx="8" fill="url(#sb-grad)" />
      <path d="M8 19V9l6 6 6-6v10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <defs>
        <linearGradient id="sb-grad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6C5CE7" />
          <stop offset="1" stopColor="#00D2A8" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function PanelIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="3" width="14" height="12" rx="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 3v12" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="m16 16-3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
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

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M8 1v1.6M8 13.4V15M15 8h-1.6M2.6 8H1M12.7 3.3l-1.13 1.13M4.43 11.57 3.3 12.7M12.7 12.7l-1.13-1.13M4.43 4.43 3.3 3.3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M13.5 9.5A6 6 0 0 1 6.5 2.5a6 6 0 1 0 7 7Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
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
  userName,
  userPicture,
  onLogout,
  theme,
  onToggleTheme,
}: SidebarProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filteredProjects = query.trim()
    ? projects.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()))
    : projects

  function handleSearchClick() {
    if (collapsed) {
      onToggleCollapsed()
    }
    setSearchOpen((v) => !v)
  }

  if (collapsed) {
    return (
      <aside className="sidebar sidebar-collapsed">
        <button className="sidebar-rail-brand" onClick={onToggleCollapsed} aria-label="Expand sidebar">
          <BrandMark />
        </button>

        <div className="sidebar-rail-actions">
          <button className="sidebar-icon-btn" onClick={onNewProject} aria-label="New project">
            <PlusIcon />
          </button>
          <button className="sidebar-icon-btn" onClick={handleSearchClick} aria-label="Search projects">
            <SearchIcon />
          </button>
          <button
            className="sidebar-icon-btn"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

        <button className="sidebar-rail-avatar" onClick={onToggleCollapsed} aria-label="Expand sidebar">
          {userPicture ? (
            <img src={userPicture} alt="" className="avatar" />
          ) : (
            <span className="avatar avatar-fallback">{userName.slice(0, 1).toUpperCase()}</span>
          )}
        </button>
      </aside>
    )
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <BrandMark />
          <span>AbhiCode</span>
        </div>
        <div className="sidebar-top-actions">
          <button className="sidebar-icon-btn" onClick={handleSearchClick} aria-label="Search projects">
            <SearchIcon />
          </button>
          <button className="sidebar-icon-btn" onClick={onToggleCollapsed} aria-label="Collapse sidebar">
            <PanelIcon />
          </button>
        </div>
      </div>

      <button className="sidebar-new-btn" onClick={onNewProject}>
        <PlusIcon />
        New project
      </button>

      {searchOpen && (
        <input
          className="sidebar-search-input"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects…"
        />
      )}

      <div className="sidebar-heading">Projects</div>

      {loading && <div className="sidebar-empty">Loading…</div>}
      {error && <div className="sidebar-error">{error}</div>}
      {!loading && !error && filteredProjects.length === 0 && (
        <div className="sidebar-empty">{query ? 'No matches' : 'No projects yet'}</div>
      )}

      <ul className="sidebar-list">
        {filteredProjects.map((project) => (
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

      <div className="sidebar-user">
        {userPicture ? (
          <img src={userPicture} alt="" className="avatar" />
        ) : (
          <span className="avatar avatar-fallback">{userName.slice(0, 1).toUpperCase()}</span>
        )}
        <span className="sidebar-user-name">{userName}</span>
        <button
          className="sidebar-icon-btn"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
        <button className="sidebar-logout-btn" onClick={onLogout}>
          Log out
        </button>
      </div>
    </aside>
  )
}
