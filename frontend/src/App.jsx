import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { Link as LinkIcon, BarChart3, Globe, LogOut, User as UserIcon } from 'lucide-react'
import { useAuth } from './context/AuthContext'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import LinkStats from './pages/LinkStats'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import './styles/App.css'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading">Checking authentication...</div>
  if (!user) return <Routes><Route path="*" element={<Login />} /></Routes>
  return children
}

function App() {
  const { user, logout } = useAuth()

  return (
    <div className="app-layout">
      <nav className="navbar glass-card">
        <div className="container nav-content">
          <Link to="/" className="logo">
            <div className="logo-icon">
              <LinkIcon size={24} color="#6366f1" />
            </div>
            <span>Linkly</span>
          </Link>
          <div className="nav-links">
            <Link to="/" className="nav-item">Shortener</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="nav-item">Dashboard</Link>
                <div className="user-profile">
                  <UserIcon size={18} />
                  <button onClick={logout} className="btn-logout">
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-item">Login</Link>
                <Link to="/register" className="btn-primary-sm">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/stats/:shortCode" 
            element={
              <ProtectedRoute>
                <LinkStats />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="container">
          <p>© 2024 Linkly. Built with FastAPI & React.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
