import { useEffect, useState } from 'react';
import { adminApi } from '../services/adminApi';

const initialFilters = { search: '', plan: 'all', legacy: 'all', paymentStatus: 'all' };

export default function Investors() {
  const [filters, setFilters] = useState(initialFilters);
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState('');

  async function load() {
    try {
      setLoading(true);
      setError('');
      const data = await adminApi.getInvestors(filters);
      setInvestors(data);
    } catch (err) {
      setError(err.message || 'Unable to load investors.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filters.search, filters.plan, filters.legacy, filters.paymentStatus]);

  async function runAction(userId, payload, successMessage) {
    try {
      setBusyId(userId);
      setNotice('');
      await adminApi.updateInvestor(userId, payload);
      setNotice(successMessage);
      await load();
    } catch (err) {
      setError(err.message || 'Unable to update investor.');
    } finally {
      setBusyId('');
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Investor Management</h1>
          <p className="page-subtitle">Track payment state, premium access, and legacy exemptions for investors.</p>
        </div>
      </div>

      {error && <div className="alert alert-error"><span>⚠</span> {error}</div>}
      {notice && <div className="alert alert-success"><span>✓</span> {notice}</div>}

      <div className="panel-card filters-card">
        <div className="filters-grid">
          <input className="form-input" placeholder="Search investor, company, or email" value={filters.search} onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))} />
          <select className="form-select" value={filters.plan} onChange={(e) => setFilters((prev) => ({ ...prev, plan: e.target.value }))}>
            <option value="all">All plans</option>
            <option value="premium">Premium</option>
            <option value="free">Free</option>
          </select>
          <select className="form-select" value={filters.legacy} onChange={(e) => setFilters((prev) => ({ ...prev, legacy: e.target.value }))}>
            <option value="all">All legacy states</option>
            <option value="legacy">Legacy only</option>
            <option value="non_legacy">Non-legacy</option>
          </select>
          <select className="form-select" value={filters.paymentStatus} onChange={(e) => setFilters((prev) => ({ ...prev, paymentStatus: e.target.value }))}>
            <option value="all">All payment states</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="free">Free</option>
          </select>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Company</th>
              <th>Payment</th>
              <th>Flags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan="6"><div className="skeleton skeleton-row" /></td>
                </tr>
              ))
            ) : investors.length === 0 ? (
              <tr>
                <td colSpan="6" className="table-empty">No investors matched these filters.</td>
              </tr>
            ) : (
              investors.map((investor) => (
                <tr key={investor.id}>
                  <td className="table-primary">{investor.name}</td>
                  <td>{investor.email}</td>
                  <td>{investor.companyName || '—'}</td>
                  <td><span className={`chip ${investor.paymentStatus === 'active' ? 'chip-success' : investor.paymentStatus === 'pending' ? 'chip-warning' : 'chip-neutral'}`}>{investor.paymentStatus}</span></td>
                  <td>
                    <div className="stacked-chips">
                      {investor.isPremium && <span className="chip chip-success">premium</span>}
                      {investor.isLegacyUser && <span className="chip chip-warning">legacy</span>}
                      {investor.isPaymentPending && <span className="chip chip-warning">payment pending</span>}
                    </div>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button className="btn btn-secondary btn-xs" disabled={busyId === investor.userId} onClick={() => runAction(investor.userId, { grantPremium: !investor.isPremium }, investor.isPremium ? 'Premium removed.' : 'Premium granted.')}>
                        {investor.isPremium ? 'Remove Premium' : 'Grant Premium'}
                      </button>
                      <button className="btn btn-secondary btn-xs" disabled={busyId === investor.userId} onClick={() => runAction(investor.userId, { isLegacyUser: !investor.isLegacyUser }, investor.isLegacyUser ? 'Legacy removed.' : 'Marked as legacy user.')}>
                        {investor.isLegacyUser ? 'Remove Legacy' : 'Mark Legacy'}
                      </button>
                      <button className="btn btn-secondary btn-xs" disabled={busyId === investor.userId} onClick={() => runAction(investor.userId, { resetPaymentStatus: true }, 'Payment state reset.')}>
                        Reset Payment
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
