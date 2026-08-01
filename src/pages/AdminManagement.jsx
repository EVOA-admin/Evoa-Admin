import { useState, useEffect } from 'react';
import {
  RiShieldUserLine,
  RiAddLine,
  RiEditLine,
  RiKeyLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiCloseLine,
  RiToggleLine,
  RiSearchLine,
  RiBuildingLine,
  RiMailLine,
  RiLockLine,
  RiUserLine,
} from 'react-icons/ri';
import { adminApi } from '../services/adminApi';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminManagement() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    fullName: '',
    companyName: '',
    email: '',
    password: '',
    isActive: true,
  });

  const [editForm, setEditForm] = useState({
    fullName: '',
    companyName: '',
    email: '',
    isActive: true,
  });

  const [newPassword, setNewPassword] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Redirect if event admin attempts to view
  useEffect(() => {
    if (profile && profile.role === 'EVENT_ADMIN') {
      navigate('/events');
    }
  }, [profile, navigate]);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminApi.getEventAdmins();
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load Event Admins list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormSubmitting(true);
      setError('');
      setSuccess('');
      await adminApi.createEventAdmin(createForm);
      setSuccess('Event Admin created successfully.');
      setShowCreateModal(false);
      setCreateForm({ fullName: '', companyName: '', email: '', password: '', isActive: true });
      await loadAdmins();
    } catch (err) {
      setError(err.message || 'Failed to create Event Admin.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditOpen = (admin) => {
    setSelectedAdmin(admin);
    setEditForm({
      fullName: admin.fullName || '',
      companyName: admin.companyName || '',
      email: admin.email || '',
      isActive: admin.isActive !== false,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    try {
      setFormSubmitting(true);
      setError('');
      setSuccess('');
      await adminApi.updateEventAdmin(selectedAdmin.id, editForm);
      setSuccess('Event Admin updated successfully.');
      setShowEditModal(false);
      setSelectedAdmin(null);
      await loadAdmins();
    } catch (err) {
      setError(err.message || 'Failed to update Event Admin.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleResetOpen = (admin) => {
    setSelectedAdmin(admin);
    setNewPassword('');
    setShowResetModal(true);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAdmin || !newPassword) return;
    try {
      setFormSubmitting(true);
      setError('');
      setSuccess('');
      await adminApi.resetAdminPassword(selectedAdmin.id, { password: newPassword });
      setSuccess(`Password for ${selectedAdmin.fullName} has been reset.`);
      setShowResetModal(false);
      setSelectedAdmin(null);
      setNewPassword('');
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (admin) => {
    try {
      setError('');
      setSuccess('');
      await adminApi.toggleAdminStatus(admin.id);
      setSuccess(`Status updated for ${admin.fullName}.`);
      await loadAdmins();
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    }
  };

  const handleDelete = async (admin) => {
    if (!window.confirm(`Are you sure you want to delete Event Admin account for "${admin.fullName}" (${admin.email})?`)) {
      return;
    }
    try {
      setError('');
      setSuccess('');
      await adminApi.deleteEventAdmin(admin.id);
      setSuccess(`Event Admin "${admin.fullName}" deleted successfully.`);
      await loadAdmins();
    } catch (err) {
      setError(err.message || 'Failed to delete Event Admin.');
    }
  };

  const filteredAdmins = admins.filter((a) => {
    const query = searchTerm.toLowerCase();
    return (
      a.fullName?.toLowerCase().includes(query) ||
      a.email?.toLowerCase().includes(query) ||
      a.companyName?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="page-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <RiShieldUserLine style={{ color: '#6366f1' }} /> Admin Management
          </h1>
          <p style={{ color: '#6b7280', marginTop: 4, fontSize: 14 }}>
            Create and manage Event Admin accounts, reset credentials, and control access permissions.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontWeight: 600 }}
        >
          <RiAddLine size={18} /> Create Admin
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, color: '#991b1b', marginBottom: 16, fontSize: 14 }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ padding: '12px 16px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, color: '#166534', marginBottom: 16, fontSize: 14 }}>
          {success}
        </div>
      )}

      {/* Search & Filter */}
      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f9fafb', padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}>
          <RiSearchLine color="#9ca3af" size={18} />
          <input
            type="text"
            placeholder="Search admins by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 14 }}
          />
        </div>
      </div>

      {/* Admins Table */}
      {loading ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
          <span style={{ display: 'inline-block', width: 28, height: 28, border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ marginTop: 12 }}>Loading Event Admins…</p>
        </div>
      ) : filteredAdmins.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: '#6b7280' }}>
          <RiShieldUserLine size={48} style={{ margin: '0 auto 12px', opacity: 0.3, color: '#6366f1' }} />
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>No Event Admins Found</h3>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
            {searchTerm ? 'No results matched your search term.' : 'Click "Create Admin" to add your first event admin account.'}
          </p>
        </div>
      ) : (
        <div className="table-container card">
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', fontSize: 13, color: '#6b7280' }}>
                <th style={{ padding: '12px 16px' }}>Admin Name & Email</th>
                <th style={{ padding: '12px 16px' }}>Company</th>
                <th style={{ padding: '12px 16px' }}>Role</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Created Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.map((admin) => (
                <tr key={admin.id} style={{ borderBottom: '1px solid #f3f4f6', fontSize: 14 }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#111827' }}>{admin.fullName}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{admin.email}</div>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#4b5563' }}>
                    {admin.companyName || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>N/A</span>}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: '#e0e7ff', color: '#3730a3' }}>
                      EVENT_ADMIN
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {admin.isActive !== false ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: '#dcfce7', color: '#166534' }}>
                        <RiCheckLine size={12} /> Active
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: '#f3f4f6', color: '#6b7280' }}>
                        <RiCloseLine size={12} /> Disabled
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: 13 }}>
                    {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 8 }}>
                      <button
                        onClick={() => handleEditOpen(admin)}
                        title="Edit Admin"
                        className="btn btn-sm btn-secondary"
                        style={{ padding: '6px 10px' }}
                      >
                        <RiEditLine size={15} />
                      </button>
                      <button
                        onClick={() => handleResetOpen(admin)}
                        title="Reset Password"
                        className="btn btn-sm btn-secondary"
                        style={{ padding: '6px 10px' }}
                      >
                        <RiKeyLine size={15} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(admin)}
                        title={admin.isActive !== false ? 'Disable Account' : 'Enable Account'}
                        className="btn btn-sm btn-secondary"
                        style={{ padding: '6px 10px', color: admin.isActive !== false ? '#d97706' : '#059669' }}
                      >
                        <RiToggleLine size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(admin)}
                        title="Delete Admin Account"
                        className="btn btn-sm btn-secondary"
                        style={{ padding: '6px 10px', color: '#dc2626' }}
                      >
                        <RiDeleteBinLine size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreateModal(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17, 24, 39, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              width: '100%',
              maxWidth: 480,
              padding: 28,
              borderRadius: 16,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e5e7eb',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
                <RiAddLine style={{ color: '#6366f1' }} size={20} /> Create Event Admin Account
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6b7280', padding: 4 }}
              >
                <RiCloseLine size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Full Name *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f9fafb', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 14px' }}>
                  <RiUserLine color="#6b7280" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={createForm.fullName}
                    onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                    style={{ border: 'none', outline: 'none', width: '100%', fontSize: 14, background: 'transparent', color: '#111827' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Company / Organization (Optional)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f9fafb', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 14px' }}>
                  <RiBuildingLine color="#6b7280" size={18} />
                  <input
                    type="text"
                    placeholder="e.g. Partner Summit LLC"
                    value={createForm.companyName}
                    onChange={(e) => setCreateForm({ ...createForm, companyName: e.target.value })}
                    style={{ border: 'none', outline: 'none', width: '100%', fontSize: 14, background: 'transparent', color: '#111827' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email Address *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f9fafb', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 14px' }}>
                  <RiMailLine color="#6b7280" size={18} />
                  <input
                    type="email"
                    required
                    placeholder="events@partnercompany.com"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    style={{ border: 'none', outline: 'none', width: '100%', fontSize: 14, background: 'transparent', color: '#111827' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Password *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f9fafb', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 14px' }}>
                  <RiLockLine color="#6b7280" size={18} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    style={{ border: 'none', outline: 'none', width: '100%', fontSize: 14, background: 'transparent', color: '#111827' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="checkbox"
                  id="createIsActive"
                  checked={createForm.isActive}
                  onChange={(e) => setCreateForm({ ...createForm, isActive: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: '#4f46e5', cursor: 'pointer' }}
                />
                <label htmlFor="createIsActive" style={{ fontSize: 14, color: '#374151', cursor: 'pointer', fontWeight: 500 }}>
                  Active Account (Allowed to sign in immediately)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                  disabled={formSubmitting}
                  style={{ padding: '9px 18px', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formSubmitting}
                  style={{ padding: '9px 20px', fontWeight: 600 }}
                >
                  {formSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedAdmin && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEditModal(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17, 24, 39, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              width: '100%',
              maxWidth: 480,
              padding: 28,
              borderRadius: 16,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e5e7eb',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
                <RiEditLine style={{ color: '#6366f1' }} size={20} /> Edit Event Admin
              </h2>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6b7280', padding: 4 }}
              >
                <RiCloseLine size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="form-input"
                  style={{ width: '100%', background: '#f9fafb' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Company Name</label>
                <input
                  type="text"
                  value={editForm.companyName}
                  onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                  className="form-input"
                  style={{ width: '100%', background: '#f9fafb' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email Address</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="form-input"
                  style={{ width: '100%', background: '#f9fafb' }}
                />
              </div>

              <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: '#4f46e5', cursor: 'pointer' }}
                />
                <label htmlFor="editIsActive" style={{ fontSize: 14, color: '#374151', cursor: 'pointer', fontWeight: 500 }}>
                  Account Active
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                  disabled={formSubmitting}
                  style={{ padding: '9px 18px', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formSubmitting}
                  style={{ padding: '9px 20px', fontWeight: 600 }}
                >
                  {formSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showResetModal && selectedAdmin && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowResetModal(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17, 24, 39, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              width: '100%',
              maxWidth: 440,
              padding: 28,
              borderRadius: 16,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e5e7eb',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
                <RiKeyLine style={{ color: '#6366f1' }} size={20} /> Reset Admin Password
              </h2>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6b7280', padding: 4 }}
              >
                <RiCloseLine size={20} />
              </button>
            </div>

            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
              Set a new password for <strong>{selectedAdmin.fullName}</strong> ({selectedAdmin.email}).
            </p>

            <form onSubmit={handleResetSubmit}>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', background: '#f9fafb' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowResetModal(false)}
                  disabled={formSubmitting}
                  style={{ padding: '9px 18px', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formSubmitting}
                  style={{ padding: '9px 20px', fontWeight: 600 }}
                >
                  {formSubmitting ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
