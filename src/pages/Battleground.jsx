import { useEffect, useState } from 'react';
import { adminApi } from '../services/adminApi';

const initialWinnerForm = { startupId: '', reelId: '', prizeTitle: '', prizeDescription: '', prizeAmount: '' };

export default function Battleground() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [manualStartupId, setManualStartupId] = useState('');
  const [overridePitchIds, setOverridePitchIds] = useState({});
  const [winnerForm, setWinnerForm] = useState(initialWinnerForm);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setError('');
      const response = await adminApi.getBattleground();
      setData(response);
    } catch (err) {
      setError(err.message || 'Unable to load battleground controls.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addStartup() {
    if (!manualStartupId.trim()) return;
    try {
      setBusy(true);
      setNotice('');
      await adminApi.addBattlegroundStartup({ startupId: manualStartupId.trim() });
      setManualStartupId('');
      setNotice('Startup added to battleground.');
      await load();
    } catch (err) {
      setError(err.message || 'Unable to add startup.');
    } finally {
      setBusy(false);
    }
  }

  async function removeStartup(registrationId) {
    try {
      setBusy(true);
      setNotice('');
      await adminApi.removeBattlegroundRegistration(registrationId);
      setNotice('Startup removed from battleground.');
      await load();
    } catch (err) {
      setError(err.message || 'Unable to remove startup.');
    } finally {
      setBusy(false);
    }
  }

  async function declareWinner() {
    if (!winnerForm.startupId.trim()) return;
    try {
      setBusy(true);
      setNotice('');
      await adminApi.declareWinner({
        startupId: winnerForm.startupId.trim(),
        reelId: winnerForm.reelId.trim() || undefined,
        prizeTitle: winnerForm.prizeTitle.trim() || undefined,
        prizeDescription: winnerForm.prizeDescription.trim() || undefined,
        prizeAmount: winnerForm.prizeAmount.trim() || undefined,
      });
      setNotice('Battleground winner declared.');
      await load();
    } catch (err) {
      setError(err.message || 'Unable to declare winner.');
    } finally {
      setBusy(false);
    }
  }

  async function overridePitch(registrationId) {
    const reelId = overridePitchIds[registrationId]?.trim();
    if (!reelId) return;

    try {
      setBusy(true);
      setNotice('');
      await adminApi.updateBattlegroundRegistration(registrationId, { selectedReelId: reelId });
      setNotice('Battleground pitch overridden.');
      await load();
    } catch (err) {
      setError(err.message || 'Unable to override pitch.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Battleground Control</h1>
          <p className="page-subtitle">Manage participants, selected pitches, prize details, and winner overrides.</p>
        </div>
      </div>

      {error && <div className="alert alert-error"><span>⚠</span> {error}</div>}
      {notice && <div className="alert alert-success"><span>✓</span> {notice}</div>}

      <div className="admin-summary-grid">
        <section className="panel-card">
          <h2 className="panel-title">Prize Details</h2>
          <p className="panel-copy">{data?.prize?.title || '—'}</p>
          <p className="panel-copy panel-copy-strong">{data?.prize?.amount || '—'}</p>
          <p className="panel-copy">{data?.prize?.description || 'No prize description set.'}</p>
        </section>
        <section className="panel-card">
          <h2 className="panel-title">Current Winner</h2>
          <p className="panel-copy">{data?.winner?.startupId || 'No winner declared yet.'}</p>
          <p className="panel-copy">{data?.winner?.declaredAt ? new Date(data.winner.declaredAt).toLocaleString() : ''}</p>
        </section>
      </div>

      <div className="panel-card">
        <h2 className="panel-title">Manual Controls</h2>
        <div className="filters-grid filters-grid-three">
          <input className="form-input" placeholder="Startup ID to add manually" value={manualStartupId} onChange={(e) => setManualStartupId(e.target.value)} />
          <input className="form-input" placeholder="Winner Startup ID" value={winnerForm.startupId} onChange={(e) => setWinnerForm((prev) => ({ ...prev, startupId: e.target.value }))} />
          <input className="form-input" placeholder="Winner Reel ID (optional)" value={winnerForm.reelId} onChange={(e) => setWinnerForm((prev) => ({ ...prev, reelId: e.target.value }))} />
          <input className="form-input" placeholder="Prize title" value={winnerForm.prizeTitle} onChange={(e) => setWinnerForm((prev) => ({ ...prev, prizeTitle: e.target.value }))} />
          <input className="form-input" placeholder="Prize amount" value={winnerForm.prizeAmount} onChange={(e) => setWinnerForm((prev) => ({ ...prev, prizeAmount: e.target.value }))} />
          <input className="form-input" placeholder="Prize description" value={winnerForm.prizeDescription} onChange={(e) => setWinnerForm((prev) => ({ ...prev, prizeDescription: e.target.value }))} />
        </div>
        <div className="admin-actions panel-actions">
          <button className="btn btn-secondary" disabled={busy} onClick={addStartup}>Add Startup</button>
          <button className="btn btn-primary" disabled={busy} onClick={declareWinner}>Declare Winner</button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Startup</th>
              <th>Founder</th>
              <th>Selected Pitch</th>
              <th>Status</th>
              <th>Winner</th>
              <th>Override Pitch</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan="7"><div className="skeleton skeleton-row" /></td>
                </tr>
              ))
            ) : !data?.participants?.length ? (
              <tr>
                <td colSpan="7" className="table-empty">No battleground participants yet.</td>
              </tr>
            ) : (
              data.participants.map((participant) => (
                <tr key={participant.id}>
                  <td className="table-primary">{participant.startupName}</td>
                  <td>{participant.founderName}</td>
                  <td>{participant.selectedPitchTitle || participant.selectedReelId || 'No selected pitch'}</td>
                  <td><span className={`chip ${participant.paymentStatus === 'success' ? 'chip-success' : participant.paymentStatus === 'failed' ? 'chip-danger' : 'chip-warning'}`}>{participant.paymentStatus}</span></td>
                  <td>{participant.isWinner ? <span className="chip chip-danger">winner</span> : <span className="chip chip-neutral">—</span>}</td>
                  <td>
                    <div className="inline-form">
                      <input
                        className="form-input input-compact"
                        placeholder="Reel ID"
                        value={overridePitchIds[participant.id] ?? ''}
                        onChange={(e) => setOverridePitchIds((prev) => ({ ...prev, [participant.id]: e.target.value }))}
                      />
                      <button className="btn btn-secondary btn-xs" disabled={busy} onClick={() => overridePitch(participant.id)}>
                        Override
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button className="btn btn-secondary btn-xs" disabled={busy} onClick={() => setWinnerForm((prev) => ({ ...prev, startupId: participant.startupId, reelId: participant.selectedReelId || '' }))}>
                        Use as Winner
                      </button>
                      <button className="btn btn-danger btn-xs" disabled={busy} onClick={() => removeStartup(participant.id)}>
                        Remove
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
