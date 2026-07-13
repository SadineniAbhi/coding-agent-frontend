import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { getSessionMessages, type Message } from '../api'
import './MainPanel.css'

type MainPanelProps = {
  selectedProjectId: string | null
  selectedProjectName: string | null
  onCreateProject: () => void
}

export default function MainPanel({ selectedProjectId, selectedProjectName, onCreateProject }: MainPanelProps) {
  if (!selectedProjectId) {
    return <EmptyState onCreateProject={onCreateProject} />
  }
  return <ProjectMessages projectId={selectedProjectId} projectName={selectedProjectName} />
}

function EmptyState({ onCreateProject }: { onCreateProject: () => void }) {
  const { user } = useAuth0()
  const firstName = user?.given_name || user?.name?.split(' ')[0] || 'there'

  return (
    <div className="main-panel main-panel-empty">
      <div className="empty-state">
        <h1>Welcome, {firstName}</h1>
        <button className="btn btn-primary" onClick={onCreateProject}>
          Create project
        </button>
      </div>
    </div>
  )
}

function ProjectMessages({ projectId, projectName }: { projectId: string; projectName: string | null }) {
  const { getAccessTokenSilently } = useAuth0()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    getSessionMessages(projectId, getAccessTokenSilently)
      .then((data) => {
        if (!cancelled) setMessages(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [projectId, getAccessTokenSilently])

  return (
    <div className="main-panel">
      <div className="main-panel-header">
        <h2>{projectName ?? projectId}</h2>
      </div>

      <div className="messages">
        {loading && <div className="messages-status">Loading messages…</div>}
        {error && <div className="messages-status messages-error">{error}</div>}
        {!loading && !error && messages.length === 0 && (
          <div className="messages-status">No messages yet for this project.</div>
        )}

        {messages.map((message, i) => (
          <div key={i} className={`message message-${message.role}`}>
            <div className="message-role">{message.role === 'user' ? 'You' : 'AbhiCode'}</div>
            <div className="message-content">{message.content}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
