import { useState, useEffect, useCallback } from 'react';
import { coordinatorApplicationsAPI } from '../../api';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';

const STATUS_COLORS = {
  pending:  { bg: 'var(--warning-bg)', color: 'var(--warning)', br: 'var(--warning-br)' },
  approved: { bg: 'var(--success-bg)', color: 'var(--success)', br: 'var(--success-br)' },
  rejected: { bg: 'var(--danger-bg)',  color: 'var(--danger)',  br: 'var(--danger-br)' },
};

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function CoordinatorApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await coordinatorApplicationsAPI.getAll(params);
      setApplications(data.data.docs || data.data || []);
    } catch { setError('Failed to load applications'); } 
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this coordinator application? A user account will be created.')) return;
    setActionLoading(id);
    try {
      await coordinatorApplicationsAPI.review(id, { action: 'approve' });
      load();
    } catch (e) { alert(e.response?.data?.message || 'Failed to approve'); } 
    finally { setActionLoading(null); }
  };

  const handleReject = async (e) => {
    if (e) e.preventDefault();
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
    } catch (e) { alert(e.response?.data?.message || 'Failed to reject'); } 
    finally { setActionLoading(null); }
  };

  const getDocumentUrl = (docPath) => {
    if (!docPath) return '#';
    const normalizedPath = docPath.replace(/\\/g, '/');
    const uploadsIndex = normalizedPath.indexOf('uploads/');
    const relativePath = uploadsIndex >= 0 ? normalizedPath.substring(uploadsIndex) : normalizedPath;
    return `${BACKEND_URL}/${relativePath}`;
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>Coordinator Applications</h1>
          <p>Review and manage coordinator registration applications</p>
        </div>
      </div>
      
      <div className="page-body page-enter">
        {error && <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-br)', padding: '12px 16px', borderRadius: 'var(--r-md)', marginBottom: '16px' }}>{error}</div>}

        <div className="filter-strip">
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <select 
              className="form-control" 
              style={{ width: '160px', height: '36px' }} 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">All Applications</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div style={{ padding: '60px 0' }}><Loader /></div>
          ) : applications.length === 0 ? (
            <div className="empty-state">
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--t4)', marginBottom: '16px' }}>description</span>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--t1)', marginBottom: '6px' }}>No {statusFilter || ''} applications found</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ minWidth: '800px' }}>
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Organization & Location</th>
                    <th>Document</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => {
                    const c = STATUS_COLORS[app.status] || { bg: 'var(--neutral-bg)', color: 'var(--t3)', br: 'var(--border)' };
                    return (
                      <tr key={app._id}>
                        <td>
                          <div className="td-primary">{app.name}</div>
                          <div className="td-secondary">{app.email}</div>
                          {app.phone && <div className="td-secondary">📞 {app.phone}</div>}
                        </td>
                        <td>
                          <div className="td-primary">{app.organization || '—'}</div>
                          <div className="td-secondary">{app.location || '—'}</div>
                        </td>
                        <td>
                          {app.documentProof ? (
                            <a href={getDocumentUrl(app.documentProof)} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: 'var(--brand)', textDecoration: 'none' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>attach_file</span>
                              View Doc
                            </a>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--t4)' }}>No file</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 'var(--r-xs)', fontSize: '11px', fontWeight: 600, background: c.bg, color: c.color, border: `1px solid ${c.br}`, textTransform: 'capitalize' }}>
                            {app.status}
                          </div>
                          {app.status === 'rejected' && app.rejectionReason && (
                            <div style={{ fontSize: '11px', color: 'var(--t4)', marginTop: '4px', maxWidth: '160px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {app.rejectionReason}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="td-primary">{new Date(app.createdAt).toLocaleDateString('en-IN')}</div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {app.status === 'pending' ? (
                            <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                              <button className="btn-success" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => handleApprove(app._id)} disabled={actionLoading === app._id}>
                                {actionLoading === app._id ? '...' : 'Approve'}
                              </button>
                              <button className="btn-danger" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => { setRejectModal(app._id); setRejectionReason(''); }} disabled={actionLoading === app._id}>
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--t4)' }}>
                              {app.status === 'approved' ? 'Account created' : 'Rejected'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {rejectModal && (
        <Modal title="Reject Application" onClose={() => setRejectModal(null)}>
          <form onSubmit={handleReject}>
            <p style={{ fontSize: '13px', color: 'var(--t3)', marginBottom: '16px' }}>
              Please provide a reason for rejecting this coordinator application. The applicant will be notified via email.
            </p>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--t2)', marginBottom: '6px' }}>Rejection Reason</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="e.g., Document provided is not a valid government ID..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-ghost" onClick={() => setRejectModal(null)}>Cancel</button>
              <button type="submit" className="btn-danger" disabled={actionLoading === rejectModal}>
                {actionLoading === rejectModal ? 'Rejecting...' : 'Reject Application'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
