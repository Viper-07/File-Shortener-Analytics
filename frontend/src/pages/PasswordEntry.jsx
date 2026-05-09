import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react'
import { linkService } from '../services/api'
import '../styles/PasswordEntry.css'

function PasswordEntry() {
  const { shortCode } = useParams()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await linkService.verifyPassword(shortCode, password)
      // If successful, the API returns the original_url
      window.location.href = data.original_url
    } catch (err) {
      setError(err.response?.data?.detail || 'Incorrect password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="password-entry-container fade-in">
      <div className="password-card glass-card">
        <div className="lock-icon-wrapper">
          <Lock className="lock-icon" size={48} />
        </div>
        
        <h2>Protected Link</h2>
        <p>This link is password protected. Please enter the password to continue.</p>

        <form onSubmit={handleSubmit} className="password-form">
          <div className="input-group">
            <input 
              type="password" 
              placeholder="Enter password..." 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
          </div>
          
          {error && (
            <div className="error-box fade-in">
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Verifying...' : 'Access Link'}
            <ArrowRight size={18} />
          </button>
        </form>
        
        <div className="password-footer">
          <p>Short code: <span className="short-code">{shortCode}</span></p>
        </div>
      </div>
    </div>
  )
}

export default PasswordEntry
