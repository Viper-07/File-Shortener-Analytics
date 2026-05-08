import React from 'react'
import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

function NotFound() {
  return (
    <div className="not-found fade-in" style={{ textAlign: 'center', padding: '100px 0' }}>
      <h1 style={{ fontSize: '6rem', color: 'var(--primary)' }}>404</h1>
      <h2 style={{ marginBottom: '2rem' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-dim)', marginBottom: '3rem' }}>
        The link you followed may be broken, or the page may have been removed.
      </p>
      <Link to="/" className="btn-primary" style={{ display: 'inline-flex', padding: '1rem 2rem' }}>
        <Home size={20} style={{ marginRight: '10px' }} />
        Back to Home
      </Link>
    </div>
  )
}

export default NotFound
