import { useAuth0 } from '@auth0/auth0-react'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import './App.css'

function App() {
  const { isLoading, isAuthenticated, error } = useAuth0()

  if (error) {
    return (
      <div className="center-screen">
        <p>Auth error: {error.message}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="center-screen">
        <p>Loading…</p>
      </div>
    )
  }

  return isAuthenticated ? <Dashboard /> : <LoginPage />
}

export default App
