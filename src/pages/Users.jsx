import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../services/adminApi';

const initialFilters = { search: '', role: 'all', plan: 'all', status: 'all' };

export default function Users() {
  const [filters, setFilters] = useState(initialFilters);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState('');

  async function load() {
    try {
      setLoading(true);
      setError('');
      const data = await adminApi.getUsers(filters);
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filters.search, filters.role, filters.plan, filters.status]);

  async function runAction(userId, payload, successMessage) {
    try {
      setBusyId(userId);
      setNotice('');
      await adminApi.updateUser(userId, payload);
      setNotice(successMessage);
      await load();
    } catch (err) {
      setError(err.message || 'Unable to update user.');
    } finally {
      setBusyId('');
    }
  }

  const totalLabel = useMemo(() => `${users.length} users`, [users.length]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage roles, activation, premium access, and legacy payment exemptions.</p>
        </div>
        <div className="page-subtitle">{totalLabel}</div>
      </div>

      {error && <div className="alert alert-error"><span>⚠</span> {error}</div>}
      {notice && <div className="alert alert-success"><span>✓</span> {notice}</div>}

      <div className="panel-card filters-card">
        <div className="filters-grid">
          <input className="form-input" placeholder="Search name or email" value={filters.search} onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))} />
          <select className="form-select" value={filters.role} onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}>
            <option value="all">All roles</option>
            <option value="startup">Startup</option>
            <option value="investor">Investor</option>
            <option value="viewer">Viewer</option>
            <option value="admin">Admin</option>
          </select>
          <select className="form-select" value={filters.plan} onChange={(e) => setFilters((prev) => ({ ...prev, plan: e.target.value }))}>
            <option value="all">All plans</option>
            <option value="free">Free</option>
            <option value="premium">Premium</option>
          </select>
          <select className="form-select" value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Flags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan="7"><div className="skeleton skeleton-row" /></td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="7" className="table-empty">No users matched these filters.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="table-primary">{user.fullName}</div>
                  </td>
                  <td>{user.email}</td>
                  <td><span className="chip chip-neutral">{user.role}</span></td>
                  <td><span className={`chip ${user.plan === 'premium' ? 'chip-success' : 'chip-neutral'}`}>{user.plan}</span></td>
                  <td><span className={`chip ${user.status === 'active' ? 'chip-success' : user.status === 'inactive' ? 'chip-danger' : 'chip-warning'}`}>{user.status}</span></td>
                  <td>
                    <div className="stacked-chips">
                      {user.isLegacyUser && <span className="chip chip-warning">legacy</span>}
                      {user.isActive === false && <span className="chip chip-danger">deactivated</span>}
                    </div>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button className="btn btn-secondary btn-xs" disabled={busyId === user.id} onClick={() => runAction(user.id, { role: user.role === 'admin' ? 'viewer' : 'admin' }, user.role === 'admin' ? 'Admin removed.' : 'Admin access granted.')}>
                        {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                      </button>
                      <button className="btn btn-secondary btn-xs" disabled={busyId === user.id} onClick={() => runAction(user.id, { isActive: !user.isActive }, user.isActive ? 'User deactivated.' : 'User activated.')}>
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="btn btn-secondary btn-xs" disabled={busyId === user.id} onClick={() => runAction(user.id, { isPremium: !user.isPremium }, user.isPremium ? 'Premium removed.' : 'Premium granted.')}>
                        {user.isPremium ? 'Remove Premium' : 'Mark Premium'}
                      </button>
                      <button className="btn btn-secondary btn-xs" disabled={busyId === user.id} onClick={() => runAction(user.id, { isLegacyUser: !user.isLegacyUser }, user.isLegacyUser ? 'Legacy flag removed.' : 'Legacy flag added.')}>
                        {user.isLegacyUser ? 'Remove Legacy' : 'Mark Legacy'}
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
