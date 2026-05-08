import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, MousePointer2, Globe, Laptop, Smartphone, Monitor, 
  Chrome, Smartphone as BrowserIcon, Clock
} from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts'
import { linkService } from '../services/api'
import '../styles/LinkStats.css'

const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b'];

function LinkStats() {
  const { shortCode } = useParams()
  const [stats, setStats] = useState(null)
  const [linkInfo, setLinkInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, infoData] = await Promise.all([
          linkService.getStats(shortCode),
          linkService.getLinkInfo(shortCode)
        ])
        setStats(statsData)
        setLinkInfo(infoData)
      } catch (err) {
        console.error('Failed to fetch stats', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [shortCode])

  if (loading) return <div className="loading">Loading analytics...</div>
  if (!stats) return <div className="error">Analytics not found.</div>

  const formatDataForPie = (dist) => {
    return Object.entries(dist).map(([name, value]) => ({ name, value }))
  }

  return (
    <div className="stats-container fade-in">
      <Link to="/dashboard" className="back-link">
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>

      <header className="stats-header">
        <div className="header-top">
          <h1>Analytics for <span className="text-primary">{shortCode}</span></h1>
          <div className="total-clicks-badge">
            <MousePointer2 size={16} />
            {stats.total_clicks} Total Clicks
          </div>
        </div>
        <p className="original-url-header">{linkInfo.original_url}</p>
      </header>

      <div className="stats-grid">
        <div className="stats-card glass-card span-2">
          <h3>Device Distribution</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={formatDataForPie(stats.clicks_by_device)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-dim)" />
                <YAxis stroke="var(--text-dim)" />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-dark)', border: '1px solid var(--border-color)' }}
                  itemStyle={{ color: 'var(--primary)' }}
                />
                <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="stats-card glass-card">
          <h3>Top Browsers</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={formatDataForPie(stats.clicks_by_browser)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {formatDataForPie(stats.clicks_by_browser).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-dark)', border: '1px solid var(--border-color)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {formatDataForPie(stats.clicks_by_browser).map((item, index) => (
                <div key={item.name} className="legend-item">
                  <span className="dot" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span>{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="stats-card glass-card span-3">
          <h3>Recent Activity</h3>
          <div className="table-responsive">
            <table className="recent-clicks-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Device</th>
                  <th>OS</th>
                  <th>Browser</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {stats.last_10_clicks.map((click, index) => (
                  <tr key={index}>
                    <td className="time-col">
                      <Clock size={14} />
                      {new Date(click.timestamp).toLocaleString()}
                    </td>
                    <td>{click.device}</td>
                    <td>{click.os}</td>
                    <td>{click.browser}</td>
                    <td>{click.country}</td>
                  </tr>
                ))}
                {stats.last_10_clicks.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No activity yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LinkStats
