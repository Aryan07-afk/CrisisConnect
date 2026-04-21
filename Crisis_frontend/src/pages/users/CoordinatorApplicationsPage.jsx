import { useState, useEffect, useCallback } from 'react';
import { coordinatorApplicationsAPI } from '../../api';
import PageHeader from '../../components/layout/PageHeader';
import Loader from '../../components/common/Loader';

const STATUS_COLORS = {
  pending:  { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  approved: { bg: 'rgba(34,197,94,0.12)',  color: '#22c55e' },
  rejected: { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444' },
};

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function CoordinatorApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState(null); // applicationId or null
  const [rejectionReason, setRejectionReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await coordinatorApplicationsAPI.getAll(params);
      setApplications(data.data.docs || data.data || []);
    } catch {
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this coordinator application? A user account will be created.')) return;
    setActionLoading(id);
    try {
      await coordinatorApplicationsAPI.review(id, { action: 'approve' });
      load();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to approve application');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal);
    try {
      await coordinatorApplicationsAPI.review(rejectModal, {
        action: 'reject',
        rejectionReason: rejectionReason || 'Application did not meet requirements.',
      });
      setRejectModal(null);
      setRejectionReason('');
      load();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to reject application');
    } finally {
      setActionLoading(null);
    }
  };

  const getDocumentUrl = (docPath) => {
    if (!docPath) return '#';
    // Normalize the path to use the correct URL format
    const normalizedPath = docPath.replace(/\\/g, '/');
    // Extract just the relative path from 'uploads/' onwards
    const uploadsIndex = normalizedPath.indexOf('uploads/');
    const relativePath = uploadsIndex >= 0 ? normalizedPath.substring(uploadsIndex) : normalizedPath;
    return `${BACKEND_URL}/${relativePath}`;
  };

  return (
    <>
      <PageHeader
        title="Coordinator Applications"
        subtitle="Review and manage coordinator registration applications"
      />
      <div className="page-body page-enter">
        {error && <div className="alert alert-error">{error}</div>}

        {/* Status filter tabs */}
        <div className="filters-bar">
          {['pending', 'approved', 'rejected', ''].map(status => (
            <button
              key={status}
              className={`btn btn-sm ${statusFilter === status ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setStatusFilter(status)}
              style={{ textTransform: 'capitalize' }}
            >
              {status || 'All'}
            </button>
          ))}
        </div>

        {loading ? <Loader /> : applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <p>No {statusFilter || ''} applications found</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Organization</th>
                    <th>Location</th>
                    <th>Document</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{app.name}</div>
                        <div style={{ fontSize: '.8rem', color: 'var(--text3)' }}>{app.email}</div>
                        {app.phone && (
                          <div style={{ fontSize: '.75rem', color: 'var(--text3)' }}>📞 {app.phone}</div>
                        )}
                      </td>
                      <td style={{ fontSize: '.85rem', color: 'var(--text2)' }}>
                        {app.organization || '—'}
                      </td>
                      <td style={{ fontSize: '.85rem', color: 'var(--text2)' }}>
                        {app.location || '—'}
                      </td>
                      <td>
                        {app.documentProof ? (
                          <a
                            href={getDocumentUrl(app.documentProof)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-ghost"
                            style={{ fontSize: '.78rem' }}
                          >
                            📎 View Doc
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text3)', fontSize: '.8rem' }}>No file</span>
                        )}
                      </td>
                      <td>
                        <div style={{
                          display: 'inline-block',
                          padding: '4px 10px', borderRadius: 20, fontSize: '.75rem', fontWeight: 600,
                          background: STATUS_COLORS[app.status]?.bg || 'var(--card2)',
                          color: STATUS_COLORS[app.status]?.color || 'var(--text2)',
                          textTransform: 'capitalize',
                        }}>
                          {app.status}
                        </div>
                        {app.status === 'rejected' && app.rejectionReason && (
                          <div style={{ fontSize: '.72rem', color: 'var(--text3)', marginTop: 4, maxWidth: 160 }}>
                            {app.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: '.85rem', color: 'var(--text2)' }}>
                        {new Date(app.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {app.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleApprove(app._id)}
                              disabled={actionLoading === app._id}
                              style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: 'none', fontWeight: 600 }}
                            >
                              {actionLoading === app._id ? '…' : '✓ Approve'}
                            </button>
                            <button
                              className="btn btn-sm"
                              onClick={() => { setRejectModal(app._id); setRejectionReason(''); }}
                              disabled={actionLoading === app._id}
                              style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: 'none', fontWeight: 600 }}
                            >
                              ✕ Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '.8rem', color: 'var(--text3)' }}>
                            {app.status === 'approved' ? 'Account created' : 'Rejected'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Rejection reason modal */}
      {rejectModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, backdropFilter: 'blur(4px)',
        }}
          onClick={() => setRejectModal(null)}
        >
          <div
            style={{
              background: 'var(--bg2, #0e1420)',
              border: '1px solid var(--border, #1e2d47)',
              borderRadius: 14, padding: '28px 32px',
              width: '100%', maxWidth: 440,
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 8px', color: 'var(--text1, #dce6f5)', fontSize: '1.1rem' }}>
              Reject Application
            </h3>
            <p style={{ color: 'var(--text2, #7a8fb5)', fontSize: '.85rem', marginBottom: 16 }}>
              Please provide a reason for rejecting this coordinator application. The applicant will be notified via email.
            </p>
            <textarea
              className="form-control"
              rows={3}
              placeholder="e.g., Document provided is not a valid government ID..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              style={{ resize: 'vertical', marginBottom: 16 }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setRejectModal(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-sm"
                onClick={handleReject}
                disabled={actionLoading === rejectModal}
                style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none', fontWeight: 600 }}
              >
                {actionLoading === rejectModal ? 'Rejecting…' : 'Reject Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
