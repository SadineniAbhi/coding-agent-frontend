import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import Sidebar from '../components/Sidebar'
import MainPanel from '../components/MainPanel'
import CreateProjectForm from '../components/CreateProjectForm'
import { connectGithub, listProjects, type Project } from '../api'
import { useTheme } from '../useTheme'
import './Dashboard.css'

export default function Dashboard() {
  const { user, logout, getAccessTokenSilently } = useAuth0()
  const { theme, toggleTheme } = useTheme()

  const [projects, setProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [projectsError, setProjectsError] = useState<string | null>(null)

  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [creatingProject, setCreatingProject] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const refreshProjects = useCallback(() => {
    setProjectsLoading(true)
    setProjectsError(null)
    return listProjects(getAccessTokenSilently)
      .then(setProjects)
      .catch((err) => setProjectsError(err instanceof Error ? err.message : String(err)))
      .finally(() => setProjectsLoading(false))
  }, [getAccessTokenSilently])

  useEffect(() => {
    refreshProjects()
  }, [refreshProjects])

  const connectStarted = useRef(false)
  useEffect(() => {
    if (connectStarted.current) return
    connectStarted.current = true
    connectGithub(getAccessTokenSilently)
      .then(({ redirect_url }) => {
        if (redirect_url && redirect_url !== window.location.origin) {
          window.location.href = redirect_url
        }
      })
      .catch((err) => console.error('Failed to connect GitHub App:', err))
  }, [getAccessTokenSilently])

  function handleSelectProject(project: Project) {
    setCreatingProject(false)
    setSelectedProject(project)
  }

  function handleNewProject() {
    setSelectedProject(null)
    setCreatingProject(true)
  }

  function handleProjectCreated(project: Project) {
    setProjects((prev) => [...prev, project])
    setSelectedProject(project)
    setCreatingProject(false)
  }

  return (
    <div className="dashboard">
      <Sidebar
        projects={projects}
        loading={projectsLoading}
        error={projectsError}
        selectedProjectId={selectedProject?.project_id ?? null}
        onSelectProject={handleSelectProject}
        onNewProject={handleNewProject}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
        userName={user?.name ?? user?.email ?? ''}
        userPicture={user?.picture}
        onLogout={() => logout({ logoutParams: { returnTo: window.location.origin } })}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {creatingProject ? (
        <CreateProjectForm onCreated={handleProjectCreated} onCancel={() => setCreatingProject(false)} />
      ) : (
        <MainPanel
          selectedProjectId={selectedProject?.project_id ?? null}
          selectedProjectName={selectedProject?.name ?? null}
          onCreateProject={handleNewProject}
        />
      )}
    </div>
  )
}
