import { useEffect, useRef, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getSessionMessages, runAgent, type Message } from '../api'
import Composer from './Composer'
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
  const { user, getAccessTokenSilently } = useAuth0()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end' })
  }, [messages])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setDraft('')
    setSendError(null)

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

  async function handleSend() {
    const task = draft.trim()
    if (!task || sending) return

    setSending(true)
    setSendError(null)
    setDraft('')
    setMessages((prev) => [...prev, { role: 'user', content: task }, { role: 'assistant', content: '' }])

    try {
      await runAgent(projectId, task, getAccessTokenSilently, (chunk) => {
        setMessages((prev) => {
          const next = [...prev]
          const last = next[next.length - 1]
          next[next.length - 1] = { ...last, content: last.content + chunk }
          return next
        })
      })
    } catch (err) {
      setSendError(err instanceof Error ? err.message : String(err))
    } finally {
      setSending(false)
    }
  }

  const isEmptyChat = !loading && !error && messages.length === 0

  if (isEmptyChat) {
    const firstName = user?.given_name || user?.name?.split(' ')[0] || 'there'
    return (
      <div className="main-panel main-panel-empty">
        <div className="chat-empty">
          <h1>What are we building in {projectName ?? 'this project'}, {firstName}?</h1>
          <Composer value={draft} onChange={setDraft} onSend={handleSend} sending={sending} />
          {sendError && <div className="messages-status messages-error">{sendError}</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="main-panel">
      <div className="messages">
        {loading && <div className="messages-status">Loading messages…</div>}
        {error && <div className="messages-status messages-error">{error}</div>}

        {messages.map((message, i) => (
          <div key={i} className={`message message-${message.role}`}>
            <div className="message-role">{message.role === 'user' ? 'You' : 'AbhiCode'}</div>
            {message.role === 'assistant' ? (
              <div className="message-content message-markdown">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
              </div>
            ) : (
              <div className="message-content">{message.content}</div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-bar">
        <Composer value={draft} onChange={setDraft} onSend={handleSend} sending={sending} />
        {sendError && <div className="messages-status messages-error">{sendError}</div>}
      </div>
    </div>
  )
}
