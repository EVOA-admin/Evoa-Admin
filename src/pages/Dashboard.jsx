import { useEffect, useState } from 'react';
import { RiArticleLine, RiCheckboxCircleLine, RiDraftLine } from 'react-icons/ri';
import { getAllBlogs } from '../services/blogService';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStats() {
      try {
        const blogs = await getAllBlogs();
        const published = blogs.filter(b => b.status === 'published').length;
        const draft = blogs.filter(b => b.status === 'draft').length;
        setStats({ total: blogs.length, published, draft });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Blogs', value: stats.total, icon: RiArticleLine, color: '#6366f1' },
    { label: 'Published', value: stats.published, icon: RiCheckboxCircleLine, color: '#22c55e' },
    { label: 'Drafts', value: stats.draft, icon: RiDraftLine, color: '#f59e0b' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your blog content</p>
      </div>

      {error && <div className="alert alert-error"><span>⚠</span> {error}</div>}

      <div className="stats-grid">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className="stat-card-icon" style={{ background: `${color}18`, color }}>
              <Icon size={24} />
            </div>
            <div className="stat-card-body">
              {loading ? (
                <div className="skeleton skeleton-number" />
              ) : (
                <div className="stat-card-value">{value}</div>
              )}
              <div className="stat-card-label">{label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
