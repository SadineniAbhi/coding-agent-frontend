import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { createProject, listGithubRepos, verifyGithubToken, type Project, type Repo } from '../api'
import './CreateProjectForm.css'

type PatStatus = 'idle' | 'verifying' | 'verified' | 'error'

type CreateProjectFormProps = {
  onCreated: (project: Project) => void
  onCancel: () => void
}

export default function CreateProjectForm({ onCreated, onCancel }: CreateProjectFormProps) {
  const { getAccessTokenSilently } = useAuth0()

  const [name, setName] = useState('')
  const [githubUserName, setGithubUserName] = useState('')
  const [description, setDescription] = useState('')
  const [patToken, setPatToken] = useState('')

  const [patStatus, setPatStatus] = useState<PatStatus>('idle')
  const [patError, setPatError] = useState<string | null>(null)

  const [repos, setRepos] = useState<Repo[]>([])
  const [reposLoading, setReposLoading] = useState(false)
  const [reposError, setReposError] = useState<string | null>(null)
  const [selectedRepoUrl, setSelectedRepoUrl] = useState<string | null>(null)

  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  function handlePatChange(value: string) {
    setPatToken(value)
    if (patStatus !== 'idle') {
      setPatStatus('idle')
      setPatError(null)
      setRepos([])
      setReposError(null)
      setSelectedRepoUrl(null)
    }
  }

  async function handleVerify() {
    setPatStatus('verifying')
    setPatError(null)

    try {
      await verifyGithubToken(patToken, getAccessTokenSilently)
      setPatStatus('verified')
    } catch (err) {
      setPatStatus('error')
      setPatError(err instanceof Error ? err.message : String(err))
      return
    }

    setReposLoading(true)
    setReposError(null)
    try {
      const repoList = await listGithubRepos(patToken, getAccessTokenSilently)
      setRepos(repoList)
    } catch (err) {
      setReposError(err instanceof Error ? err.message : String(err))
    } finally {
      setReposLoading(false)
    }
  }

  async function handleCreate() {
    if (!selectedRepoUrl) return
    setCreating(true)
    setCreateError(null)
    try {
      const project = await createProject(
        {
          name: name.trim(),
          github_user_name: githubUserName.trim(),
          github_pat_token: patToken,
          github_repo_url: selectedRepoUrl,
          description: description.trim() || undefined,
        },
        getAccessTokenSilently,
      )
      onCreated(project)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : String(err))
    } finally {
      setCreating(false)
    }
  }

  const canCreate =
    name.trim().length > 0 &&
    githubUserName.trim().length > 0 &&
    patStatus === 'verified' &&
    selectedRepoUrl !== null &&
    !creating

  return (
    <div className="main-panel">
      <div className="main-panel-header">
        <h2>New project</h2>
      </div>

      <div className="create-form">
        <label className="field">
          <span className="field-label">Name</span>
          <input
            className="field-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="my-project"
          />
        </label>

        <label className="field">
          <span className="field-label">GitHub username</span>
          <input
            className="field-input"
            value={githubUserName}
            onChange={(e) => setGithubUserName(e.target.value)}
            placeholder="octocat"
          />
        </label>

        <label className="field">
          <span className="field-label">Description (optional)</span>
          <textarea
            className="field-input field-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this project about?"
          />
        </label>

        <label className="field">
          <span className="field-label">GitHub personal access token</span>
          <div className="pat-row">
            <input
              className="field-input"
              type="password"
              value={patToken}
              onChange={(e) => handlePatChange(e.target.value)}
              placeholder="ghp_…"
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleVerify}
              disabled={!patToken || patStatus === 'verifying'}
            >
              {patStatus === 'verifying' ? 'Verifying…' : 'Verify'}
            </button>
          </div>
          {patStatus === 'verified' && <div className="field-status field-status-ok">Token verified</div>}
          {patStatus === 'error' && <div className="field-status field-status-error">{patError}</div>}
        </label>

        {patStatus === 'verified' && (
          <div className="field">
            <span className="field-label">Repository</span>

            {reposLoading && <div className="field-status">Loading repositories…</div>}
            {reposError && <div className="field-status field-status-error">{reposError}</div>}
            {!reposLoading && !reposError && repos.length === 0 && (
              <div className="field-status">No repositories found for this account.</div>
            )}

            {repos.length > 0 && (
              <ul className="repo-list">
                {repos.map((repo) => (
                  <li key={repo.url}>
                    <button
                      type="button"
                      className={
                        repo.url === selectedRepoUrl ? 'repo-item repo-item-selected' : 'repo-item'
                      }
                      onClick={() => setSelectedRepoUrl(repo.url)}
                    >
                      {repo.full_name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {createError && <div className="field-status field-status-error">{createError}</div>}

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleCreate} disabled={!canCreate}>
            {creating ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}
