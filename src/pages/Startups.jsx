import { useEffect, useState } from 'react';
import { adminApi } from '../services/adminApi';

const initialFilters = { search: '', plan: 'all', battleground: 'all' };

export default function Startups() {
  const [filters, setFilters] = useState(initialFilters);
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState('');

  async function load() {
    try {
      setLoading(true);
      setError('');
      const data = await adminApi.getStartups(filters);
      setStartups(data);
    } catch (err) {
      setError(err.message || 'Unable to load startups.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filters.search, filters.plan, filters.battleground]);

  async function runStartupAction(startupId, payload, successMessage) {
    try {
      setBusyId(startupId);
      setNotice('');
      await adminApi.updateStartup(startupId, payload);
      setNotice(successMessage);
      await load();
    } catch (err) {
      setError(err.message || 'Unable to update startup.');
    } finally {
      setBusyId('');
    }
  }

  async function removePitch(startupId, reelId) {
    try {
      setBusyId(reelId);
      setNotice('');
      await adminApi.removeStartupPitch(startupId, reelId);
      setNotice('Pitch removed.');
      await load();
    } catch (err) {
      setError(err.message || 'Unable to remove pitch.');
    } finally {
      setBusyId('');
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Startup Management</h1>
          <p className="page-subtitle">Review pitches, premium state, and battleground assignment from one place.</p>
        </div>
      </div>

      {error && <div className="alert alert-error"><span>⚠</span> {error}</div>}
      {notice && <div className="alert alert-success"><span>✓</span> {notice}</div>}

      <div className="panel-card filters-card">
        <div className="filters-grid filters-grid-three">
          <input className="form-input" placeholder="Search startup or founder" value={filters.search} onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))} />
          <select className="form-select" value={filters.plan} onChange={(e) => setFilters((prev) => ({ ...prev, plan: e.target.value }))}>
            <option value="all">All plans</option>
            <option value="premium">Premium founders</option>
            <option value="free">Free founders</option>
          </select>
          <select className="form-select" value={filters.battleground} onChange={(e) => setFilters((prev) => ({ ...prev, battleground: e.target.value }))}>
            <option value="all">All battleground states</option>
            <option value="participating">Participating</option>
            <option value="not_participating">Not participating</option>
          </select>
        </div>
      </div>

      <div className="stacked-panels">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => <div key={index} className="panel-card"><div className="skeleton skeleton-row" /></div>)
        ) : startups.length === 0 ? (
          <div className="empty-state">
            <h3>No startups found</h3>
            <p>Adjust the filters to broaden the results.</p>
          </div>
        ) : (
          startups.map((startup) => (
            <section key={startup.id} className="panel-card">
              <div className="panel-header-row">
                <div>
                  <h2 className="panel-title">{startup.name}</h2>
                  <p className="panel-copy">{startup.founderName} {startup.founderEmail ? `• ${startup.founderEmail}` : ''}</p>
                </div>
                <div className="stacked-chips">
                  <span className={`chip ${startup.isPremium ? 'chip-success' : 'chip-neutral'}`}>{startup.isPremium ? 'premium' : 'free'}</span>
                  <span className={`chip ${startup.isBattlegroundParticipant ? 'chip-danger' : 'chip-neutral'}`}>{startup.isBattlegroundParticipant ? 'battleground' : 'not in battleground'}</span>
                  <span className="chip chip-neutral">{startup.pitchCount} pitches</span>
                </div>
              </div>

              <div className="admin-actions panel-actions">
                <button className="btn btn-secondary btn-xs" disabled={busyId === startup.id} onClick={() => runStartupAction(startup.id, { forcePremium: !startup.isPremium }, startup.isPremium ? 'Premium removed from founder.' : 'Founder marked premium.')}>
                  {startup.isPremium ? 'Remove Premium' : 'Force Premium'}
                </button>
              </div>

              <div className="table-wrap inner-table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Pitch</th>
                      <th>Created</th>
                      <th>Battleground</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {startup.pitches.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="table-empty">No pitches uploaded yet.</td>
                      </tr>
                    ) : (
                      startup.pitches.map((pitch) => (
                        <tr key={pitch.id}>
                          <td className="table-primary">{pitch.title}</td>
                          <td>{new Date(pitch.createdAt).toLocaleDateString()}</td>
                          <td>
                            {startup.selectedBattlegroundReelId === pitch.id ? (
                              <span className="chip chip-danger">selected</span>
                            ) : (
                              <span className="chip chip-neutral">not selected</span>
                            )}
                          </td>
                          <td>
                            <div className="admin-actions">
                              <button className="btn btn-secondary btn-xs" disabled={busyId === startup.id} onClick={() => runStartupAction(startup.id, { selectedBattlegroundReelId: startup.selectedBattlegroundReelId === pitch.id ? null : pitch.id }, startup.selectedBattlegroundReelId === pitch.id ? 'Battleground pitch removed.' : 'Battleground pitch assigned.')}>
                                {startup.selectedBattlegroundReelId === pitch.id ? 'Remove from BG' : 'Assign to BG'}
                              </button>
                              <button className="btn btn-danger btn-xs" disabled={busyId === pitch.id} onClick={() => removePitch(startup.id, pitch.id)}>
                                Remove Pitch
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
