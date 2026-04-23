import { useEffect, useState } from 'react';
import {
  RiGroupLine,
  RiRocketLine,
  RiFundsLine,
  RiVipCrownLine,
  RiMoneyRupeeCircleLine,
  RiSwordLine,
} from 'react-icons/ri';
import { adminApi } from '../services/adminApi';

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setError('');
        const data = await adminApi.getOverview();
        setOverview(data);
      } catch (err) {
        setError(err.message || 'Unable to load dashboard.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const statCards = [
    { label: 'Total Users', value: overview?.totalUsers ?? 0, icon: RiGroupLine, color: '#0f766e' },
    { label: 'Total Startups', value: overview?.totalStartups ?? 0, icon: RiRocketLine, color: '#2563eb' },
    { label: 'Total Investors', value: overview?.totalInvestors ?? 0, icon: RiFundsLine, color: '#7c3aed' },
    { label: 'Active Subscriptions', value: overview?.activeSubscriptions ?? 0, icon: RiVipCrownLine, color: '#b45309' },
    { label: 'Total Revenue', value: currency.format(overview?.totalRevenue ?? 0), icon: RiMoneyRupeeCircleLine, color: '#15803d' },
    { label: 'Battleground Participants', value: overview?.totalBattlegroundParticipants ?? 0, icon: RiSwordLine, color: '#dc2626' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Platform Dashboard</h1>
          <p className="page-subtitle">A compact, full-access view of the Evoa platform.</p>
        </div>
      </div>

      {error && <div className="alert alert-error"><span>⚠</span> {error}</div>}

      <div className="stats-grid stats-grid-admin">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className="stat-card-icon" style={{ background: `${color}15`, color }}>
              <Icon size={24} />
            </div>
            <div className="stat-card-body">
              {loading ? <div className="skeleton skeleton-number" /> : <div className="stat-card-value stat-card-value-compact">{value}</div>}
              <div className="stat-card-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-summary-grid">
        <section className="panel-card">
          <h2 className="panel-title">Admin Access</h2>
          <p className="panel-copy">
            Admin accounts bypass subscription checks, upload caps, payment gates, and battleground restrictions across the platform.
          </p>
        </section>
        <section className="panel-card">
          <h2 className="panel-title">Control Areas</h2>
          <p className="panel-copy">
            Manage users, startups, investors, battleground participants, and payment activity from the sections in the sidebar.
          </p>
        </section>
      </div>
    </div>
  );
}
