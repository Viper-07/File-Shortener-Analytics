import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, UserPlus, ArrowRight, Globe, Smartphone } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import '../styles/Auth.css'

function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match.')
    }

    setLoading(true)
    try {
      await register(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError('Failed to create account. Email might already be in use.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container fade-in">
      <div className="auth-card glass-card">
        <div className="auth-header">
          <div className="auth-icon-box">
            <UserPlus size={32} color="#6366f1" />
          </div>
          <h1>Create Account</h1>
          <p>Join Linkly to start shortening and tracking links</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} />
              <input 
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-divider">Or continue with</div>

        <div className="social-buttons">
          <a href={`${import.meta.env.VITE_API_URL || ''}/api/v1/auth/google/login`} className="btn-social">
            <Globe size={18} />
            Google
          </a>
          <a href={`${import.meta.env.VITE_API_URL || ''}/api/v1/auth/apple/login`} className="btn-social">
            <Smartphone size={18} />
            Apple
          </a>
        </div>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  )
}

export default Register
