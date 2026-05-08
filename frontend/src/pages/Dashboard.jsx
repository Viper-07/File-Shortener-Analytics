import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart2, ExternalLink, Calendar, MousePointer2 } from 'lucide-react'
import api from '../services/api'
import '../styles/Dashboard.css'

function Dashboard() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const response = await api.get('/links/')
        setLinks(response.data)
      } catch (err) {
        console.error('Failed to fetch links', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLinks()
  }, [])

  if (loading) return <div className="loading">Loading links...</div>

  return (
    <div className="dashboard-container fade-in">
      <header className="dashboard-header">
        <h1>Your Links</h1>
        <p className="subtitle">Manage and track your shortened URLs</p>
      </header>

      {links.length === 0 ? (
        <div className="empty-state glass-card">
          <p>You haven't shortened any links yet.</p>
          <Link to="/" className="btn-primary">Create your first link</Link>
        </div>
      ) : (
        <div className="links-grid">
          {links.map((link) => (
            <div key={link.short_code} className="link-card glass-card">
              <div className="link-card-body">
                <div className="link-main-info">
                  <h3>{link.short_code}</h3>
                  <a href={link.short_url} target="_blank" rel="noreferrer" className="short-url">
                    {link.short_url} <ExternalLink size={14} />
                  </a>
                  <p className="original-url">{link.original_url}</p>
                </div>
                
                <div className="link-meta">
                  <div className="meta-item">
                    <Calendar size={14} />
                    <span>{new Date(link.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="link-card-footer">
                <Link to={`/stats/${link.short_code}`} className="btn-stats">
                  <BarChart2 size={18} />
                  View Analytics
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard
