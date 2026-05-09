import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart2, ExternalLink, Calendar, MousePointer2, QrCode, Share2, Lock, UserCheck, Clock, Send, MessageCircle, Mail } from 'lucide-react'
import api from '../services/api'
import '../styles/Dashboard.css'

function Dashboard() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeQr, setActiveQr] = useState(null)

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

  const handleShare = (link, platform) => {
    const text = `Check out this link: ${link.short_url}`
    let url = ''
    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(text)}`
        break
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(link.short_url)}&text=${encodeURIComponent(text)}`
        break
      case 'email':
        url = `mailto:?subject=Shared Link&body=${encodeURIComponent(text)}`
        break
      default:
        return
    }
    window.open(url, '_blank')
  }

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
                  {link.is_protected && (
                    <div className="meta-item protected" title="Password Protected">
                      <Lock size={14} />
                      <span>Protected</span>
                    </div>
                  )}
                  {link.is_one_time && (
                    <div className="meta-item one-time" title="One-time Use">
                      <UserCheck size={14} />
                      <span>One-time</span>
                    </div>
                  )}
                  {link.expires_at && (
                    <div className="meta-item expiry" title={`Expires on ${new Date(link.expires_at).toLocaleString()}`}>
                      <Clock size={14} />
                      <span>{new Date(link.expires_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="link-card-footer">
                <Link to={`/stats/${link.short_code}`} className="btn-stats">
                  <BarChart2 size={18} />
                  Analytics
                </Link>
                <button onClick={() => setActiveQr(link)} className="btn-qr">
                  <QrCode size={18} />
                  QR
                </button>
                <div className="share-actions">
                  <button onClick={() => handleShare(link, 'whatsapp')} title="Share on WhatsApp">
                    <MessageCircle size={18} />
                  </button>
                  <button onClick={() => handleShare(link, 'telegram')} title="Share on Telegram">
                    <Send size={18} />
                  </button>
                  <button onClick={() => handleShare(link, 'email')} title="Share via Email">
                    <Mail size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeQr && (
        <div className="modal-overlay" onClick={() => setActiveQr(null)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>QR Code for {activeQr.short_code}</h3>
              <button onClick={() => setActiveQr(null)} className="btn-close">&times;</button>
            </div>
            <div className="qr-display">
              <img src={`/api/v1/links/${activeQr.short_code}/qr`} alt="QR Code" />
            </div>
            <div className="modal-footer">
              <a 
                href={`/api/v1/links/${activeQr.short_code}/qr`} 
                download={`qr-${activeQr.short_code}.png`}
                className="btn-primary"
              >
                Download QR Code
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
