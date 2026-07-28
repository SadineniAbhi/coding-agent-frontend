import { useAuth0 } from '@auth0/auth0-react'
import './LoginPage.css'

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}

function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <rect width="28" height="28" rx="8" fill="url(#ac-grad)" />
      <path d="M8 19V9l6 6 6-6v10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <defs>
        <linearGradient id="ac-grad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6C5CE7" />
          <stop offset="1" stopColor="#00D2A8" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function LoginPage() {
  const { loginWithRedirect, isLoading } = useAuth0()

  const continueWithGitHub = () =>
    loginWithRedirect({ authorizationParams: { connection: 'github' } })

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <LogoMark />
          <span>AbhiCode</span>
        </div>

        <div className="login-copy">
          <h1>
            Ship code
            <br />
            without the wait
          </h1>
          <p className="login-subhead">Your AI teammate for real repos</p>

          <div className="login-card">
            <button className="btn btn-github" onClick={continueWithGitHub} disabled={isLoading}>
              <GitHubIcon />
              Continue with GitHub
            </button>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="art-panel">
          <div className="art-grid">
            {Array.from({ length: 24 }).map((_, i) => (
              <span key={i} className="art-cell" style={{ animationDelay: `${(i % 8) * 0.15}s` }} />
            ))}
          </div>
          <div className="art-glow" />
        </div>
      </div>
    </div>
  )
}
