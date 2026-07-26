import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { createProject, listGithubRepos, type Project, type Repo } from '../api'
import './CreateProjectForm.css'

type CreateProjectFormProps = {
  onCreated: (project: Project) => void
  onCancel: () => void
}

// Fuzzy-matches `query` against `text` as an ordered subsequence (fzf-style).
// Returns a score (higher is better, consecutive/early matches score higher) or null if no match.
function fuzzyScore(text: string, query: string): number | null {
  if (!query) return 0

  let score = 0
  let textIndex = 0
  let consecutive = 0

  for (const char of query) {
    const foundAt = text.indexOf(char, textIndex)
    if (foundAt === -1) return null

    consecutive = foundAt === textIndex ? consecutive + 1 : 0
    score += 1 + consecutive - foundAt * 0.01
    textIndex = foundAt + 1
  }

  return score
}

export default function CreateProjectForm({ onCreated, onCancel }: CreateProjectFormProps) {
  const { getAccessTokenSilently } = useAuth0()

  const [name, setName] = useState('')
  const [githubUserName, setGithubUserName] = useState('')
  const [description, setDescription] = useState('')

  const [repos, setRepos] = useState<Repo[]>([])
  const [reposLoading, setReposLoading] = useState(true)
  const [reposError, setReposError] = useState<string | null>(null)
  const [selectedRepoUrl, setSelectedRepoUrl] = useState<string | null>(null)
  const [repoSearch, setRepoSearch] = useState('')

  const query = repoSearch.trim().toLowerCase()
  const filteredRepos = query
    ? repos
        .map((repo) => ({ repo, score: fuzzyScore(repo.full_name.toLowerCase(), query) }))
        .filter((r): r is { repo: Repo; score: number } => r.score !== null)
        .sort((a, b) => b.score - a.score)
        .map((r) => r.repo)
    : repos

  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    setReposLoading(true)
    setReposError(null)
    listGithubRepos(getAccessTokenSilently)
      .then(setRepos)
      .catch((err) => setReposError(err instanceof Error ? err.message : String(err)))
      .finally(() => setReposLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCreate() {
    if (!selectedRepoUrl) return
    setCreating(true)
    setCreateError(null)
    try {
      const project = await createProject(
        {
          name: name.trim(),
          github_user_name: githubUserName.trim(),
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

        <div className="field">
          <span className="field-label">Repository</span>

          {reposLoading && <div className="field-status">Loading repositories…</div>}
          {reposError && <div className="field-status field-status-error">{reposError}</div>}
          {!reposLoading && !reposError && repos.length === 0 && (
            <div className="field-status">No repositories found for this account.</div>
          )}

          {!reposLoading && repos.length > 0 && (
            <input
              className="field-input"
              value={repoSearch}
              onChange={(e) => setRepoSearch(e.target.value)}
              placeholder="Search repositories…"
            />
          )}

          {!reposLoading && repos.length > 0 && filteredRepos.length === 0 && (
            <div className="field-status">No repositories match "{repoSearch}".</div>
          )}

          {!reposLoading && filteredRepos.length > 0 && (
            <ul className="repo-list">
              {filteredRepos.map((repo) => (
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
