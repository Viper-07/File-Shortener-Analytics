import React, { useState } from 'react'
import { Link2, Copy, Check, ArrowRight, Zap, Shield, BarChart } from 'lucide-react'
import { linkService } from '../services/api'
import '../styles/Home.css'

function Home() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!url) return
    
    setLoading(true)
    setError('')
    try {
      const data = await linkService.shorten(url)
      setResult(data)
      setUrl('')
    } catch (err) {
      setError('Failed to shorten URL. Please check the link and try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.short_url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="home-container fade-in">
      <section className="hero">
        <h1 className="hero-title">
          Shorten Your Links. <br />
          <span className="text-gradient">Track Your Impact.</span>
        </h1>
        <p className="hero-subtitle">
          Create short, branded links and get real-time analytics on who's clicking, from where, and on what device.
        </p>
      </section>

      <section className="shortener-box glass-card">
        <form onSubmit={handleSubmit} className="shortener-form">
          <div className="input-group">
            <Link2 className="input-icon" size={20} />
            <input 
              type="url" 
              placeholder="Paste your long link here..." 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Shortening...' : 'Shorten Now'}
            <ArrowRight size={18} />
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

        {result && (
          <div className="result-card fade-in">
            <div className="result-info">
              <span className="label">Your shortened link:</span>
              <div className="short-url-display">
                <a href={result.short_url} target="_blank" rel="noreferrer">{result.short_url}</a>
                <button onClick={copyToClipboard} className="btn-copy">
                  {copied ? <Check size={18} color="#22c55e" /> : <Copy size={18} />}
                </button>
              </div>
            </div>
            <div className="result-footer">
              <span>Redirects to: {result.original_url.substring(0, 50)}...</span>
            </div>
          </div>
        )}
      </section>

      <section className="features-grid">
        <div className="feature-card glass-card">
          <Zap className="feature-icon" color="#8b5cf6" />
          <h3>Lightning Fast</h3>
          <p>Links redirect in milliseconds with Redis-backed caching logic.</p>
        </div>
        <div className="feature-card glass-card">
          <BarChart className="feature-icon" color="#ec4899" />
          <h3>Deep Analytics</h3>
          <p>Get detailed insights on browsers, countries, and devices.</p>
        </div>
        <div className="feature-card glass-card">
          <Shield className="feature-icon" color="#10b981" />
          <h3>Secure & Reliable</h3>
          <p>Privacy-first tracking and high-availability database architecture.</p>
        </div>
      </section>
    </div>
  )
}

export default Home
