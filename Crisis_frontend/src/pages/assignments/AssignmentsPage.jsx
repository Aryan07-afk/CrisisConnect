import { useState, useEffect, useCallback } from 'react';
import { assignmentsAPI, requestsAPI, volunteersAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/layout/PageHeader';
import Badge, { PriorityDot } from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';

const STATUSES = ['','assigned','accepted','in_progress','completed','rejected'];

export default function AssignmentsPage() {
  const { isVolunteer, canManage } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('');
  const [search, setSearch]     = useState('');
  const [showAssign, setShowAssign] = useState(false);
  const [error, setError]       = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = isVolunteer
        ? await assignmentsAPI.getMy()
        : await assignmentsAPI.getAll(filter ? { status: filter } : {});
      setAssignments(data.data.docs);
    } catch { setError('Failed to load assignments'); }
    finally { setLoading(false); }
  }, [filter, isVolunteer]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    setActionLoading(id + status);
    try {
      await assignmentsAPI.updateStatus(id, { status });
      load();
    } catch (e) { alert(e.response?.data?.message || 'Update failed'); }
    finally { setActionLoading(null); }
  };

  const deleteAssignment = async (id) => {
    if (!confirm('Cancel this assignment?')) return;
    try { await assignmentsAPI.delete(id); load(); }
    catch (e) { alert(e.response?.data?.message || 'Delete failed'); }
  };

  const filtered = assignments.filter(a => {
    if (!search) return true;
    const title = a.request?.title || '';
    const vname = a.volunteer?.name || '';
    return title.toLowerCase().includes(search.toLowerCase()) ||
           vname.toLowerCase().includes(search.toLowerCase());
  });

  const nextActions = (status) => {
    const map = {
      assigned:    [{ label: '✓ Accept', status: 'accepted', cls: 'btn-success' },
                    { label: '✕ Reject', status: 'rejected', cls: 'btn-danger' }],
      accepted:    [{ label: '▶ Start', status: 'in_progress', cls: 'btn-primary' }],
      in_progress: [{ label: '✔ Complete', status: 'completed', cls: 'btn-success' }],
    };
    return map[status] || [];
  };

  return (
    <>
      <PageHeader
        title="Assignments"
        subtitle={isVolunteer ? 'Your assigned relief tasks' : 'Manage volunteer-request assignments'}
        actions={canManage && (
          <button className="btn btn-primary" onClick={() => setShowAssign(true)}>
            + Assign Volunteer
          </button>
        )}
      />
      <div className="page-body page-enter">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="filters-bar">
          <input
            className="form-control search-input"
            placeholder="🔍  Search by request or volunteer…"
            value={search} onChange={e => setSearch(e.target.value)}
          />
          <select className="form-control" value={filter}
            onChange={e => setFilter(e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s || 'All Status'}</option>)}
          </select>
          {(filter || search) && (
            <button className="btn btn-ghost btn-sm"
              onClick={() => { setFilter(''); setSearch(''); }}>✕ Clear</button>
          )}
        </div>

        {loading ? <Loader /> : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>No assignments found</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(a => (
              <div key={a._id} className="card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'start' }}>

                  {/* Left: request info */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      {a.request?.priority && <PriorityDot priority={a.request.priority} />}
                      <span style={{ fontWeight: 700, fontSize: '.95rem' }}>{a.request?.title || 'Unknown Request'}</span>
                      <Badge value={a.status} />
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: '.78rem', color: 'var(--text3)' }}>
                      {a.request?.requestType && (
                        <span>🏷 {a.request.requestType}</span>
                      )}
                      {a.request?.location?.area && (
                        <span>📍 {a.request.location.area}</span>
                      )}
                      {!isVolunteer && a.volunteer?.name && (
                        <span>👤 {a.volunteer.name}</span>
                      )}
                      {a.assignedBy?.name && (
                        <span>Assigned by {a.assignedBy.name}</span>
                      )}
                      <span style={{ fontFamily: 'var(--font-mono)' }}>
                        {new Date(a.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    {a.remarks && (
                      <div style={{ marginTop: 6, fontSize: '.8rem', color: 'var(--text2)', fontStyle: 'italic' }}>
                        "{a.remarks}"
                      </div>
                    )}
                  </div>

                  {/* Right: actions */}
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
                    {isVolunteer && nextActions(a.status).map(action => (
                      <button
                        key={action.status}
                        className={`btn btn-sm ${action.cls}`}
                        disabled={actionLoading === a._id + action.status}
                        onClick={() => updateStatus(a._id, action.status)}
                      >
                        {actionLoading === a._id + action.status ? '…' : action.label}
                      </button>
                    ))}
                    {canManage && (
                      <button className="btn btn-danger btn-sm"
                        onClick={() => deleteAssignment(a._id)}>Cancel</button>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                  {[
                    { label: 'Assigned', time: a.createdAt, done: true },
                    { label: 'Accepted', time: a.acceptedAt, done: !!a.acceptedAt },
                    { label: 'In Progress', time: null, done: ['in_progress','completed'].includes(a.status) },
                    { label: 'Completed', time: a.completedAt, done: a.status === 'completed' },
                  ].map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '.72rem' }}>
                      <span style={{
                        width: 16, height: 16, borderRadius: '50%', display: 'inline-flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: '.6rem',
                        background: step.done ? 'var(--green)' : 'var(--bg4)',
                        border: `1px solid ${step.done ? 'var(--green)' : 'var(--border)'}`,
                        color: step.done ? '#fff' : 'var(--text3)',
                      }}>
                        {step.done ? '✓' : '○'}
                      </span>
                      <span style={{ color: step.done ? 'var(--text2)' : 'var(--text3)' }}>
                        {step.label}
                        {step.time && <span style={{ color: 'var(--text3)', marginLeft: 3 }}>
                          {new Date(step.time).toLocaleDateString('en-IN')}
                        </span>}
                      </span>
                      {i < 3 && <span style={{ color: 'var(--border2)', marginLeft: 2 }}>──</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAssign && (
        <AssignModal
          onClose={() => setShowAssign(false)}
          onSuccess={() => { setShowAssign(false); load(); }}
        />
      )}
    </>
  );
}

/* ── Assign Volunteer Modal ───────────────────────────────── */
function AssignModal({ onClose, onSuccess }) {
  const [requests,   setRequests]   = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [form, setForm] = useState({ requestId: '', volunteerId: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    Promise.all([
      requestsAPI.getAll({ status: 'pending' }),
      volunteersAPI.getAll({ isAvailable: 'true' }),
    ]).then(([r, v]) => {
      setRequests(r.data.data.docs);
      setVolunteers(v.data.data);
    });
  }, []);

  const submit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await assignmentsAPI.create(form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Assignment failed');
    } finally { setSaving(false); }
  };

  return (
    <Modal title="Assign Volunteer to Request" onClose={onClose}>
      <form onSubmit={submit}>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-group">
          <label className="form-label">Pending Request *</label>
          <select className="form-control" value={form.requestId}
            onChange={e => setForm(f => ({ ...f, requestId: e.target.value }))} required>
            <option value="">— Select request —</option>
            {requests.map(r => (
              <option key={r._id} value={r._id}>
                [{r.priority.toUpperCase()}] {r.title} — {r.location?.area || r.location?.address}
              </option>
            ))}
          </select>
          {requests.length === 0 && (
            <div className="form-error">No pending requests available</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Available Volunteer *</label>
          <select className="form-control" value={form.volunteerId}
            onChange={e => setForm(f => ({ ...f, volunteerId: e.target.value }))} required>
            <option value="">— Select volunteer —</option>
            {volunteers.map(v => (
              <option key={v._id} value={v._id}>
                {v.name} — {v.skills?.join(', ') || 'general'} ({v.location || 'unknown location'})
              </option>
            ))}
          </select>
          {volunteers.length === 0 && (
            <div className="form-error">No available volunteers</div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary"
            disabled={saving || !form.requestId || !form.volunteerId}>
            {saving ? 'Assigning…' : 'Assign →'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
