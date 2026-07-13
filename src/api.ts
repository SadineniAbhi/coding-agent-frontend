import { API_BASE_URL } from './env'

export type Project = {
  project_id: string
  name: string
}

export type Message = {
  role: 'user' | 'assistant'
  content: string
}

export type Repo = {
  full_name: string
  url: string
}

export type CreateProjectPayload = {
  name: string
  github_user_name: string
  github_pat_token: string
  github_repo_url: string
  description?: string
}

type GetToken = () => Promise<string>

async function extractErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json()
    if (typeof data?.error === 'string') return data.error
  } catch {
    // response body wasn't JSON — fall through to generic message
  }
  return `Request failed with status ${res.status}`
}

async function authedFetch(path: string, getToken: GetToken, init?: RequestInit): Promise<Response> {
  const token = await getToken()
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res))
  }
  return res
}

async function authedPostJson<T>(path: string, body: unknown, getToken: GetToken): Promise<T> {
  const res = await authedFetch(path, getToken, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return (await res.json()) as T
}

export async function listProjects(getToken: GetToken): Promise<Project[]> {
  const res = await authedFetch('/projects', getToken)
  const data = await res.json()
  return data.projects as Project[]
}

export async function getSessionMessages(projectId: string, getToken: GetToken): Promise<Message[]> {
  const res = await authedFetch(`/agent/${projectId}/messages`, getToken)
  return (await res.json()) as Message[]
}

export async function verifyGithubToken(token: string, getToken: GetToken): Promise<void> {
  await authedPostJson('/github/verify-token', { token }, getToken)
}

export async function listGithubRepos(token: string, getToken: GetToken): Promise<Repo[]> {
  return authedPostJson<Repo[]>('/github/list-repos', { token }, getToken)
}

export async function createProject(payload: CreateProjectPayload, getToken: GetToken): Promise<Project> {
  return authedPostJson<Project>('/project', payload, getToken)
}
