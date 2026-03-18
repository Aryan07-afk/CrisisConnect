import { useState, useEffect, useCallback } from 'react';
import { victimAPI, requestsAPI } from '../../api';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';

const STATUSES  = ['','submitted','reviewing','linked','resolved','closed'];
const URGENCIES = ['','critical','high','medium','low'];
const TYPES     = ['','food','water','shelter','medical','rescue','clothing','other'];

export default function VictimRequestsAdmin() {
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filters, setFilters]     = useState({ status: '', urgency: '', needType: '' });
  const [search, setSearch]       = useState('');
  const [manageItem, setManageItem] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status)   params.status   = filters.status;
      if (filters.urgency)  params.urgency  = filters.urgency;
      if (filters.needType) params.needType = filters.needType;
      const { data } = await victimAPI.getAll(params);
      setRequests(data.data);
    } catch { }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const filtered = requests.filter(r => {
    if (!search) return true;
    const name = r.victim?.name || '';
    const addr = r.location?.address || '';
    return name.toLowerCase().includes(search.toLowerCase()) ||
           addr.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      <PageHeader
        title="Victim Requests"
        subtitle="Direct SOS requests submitted by victims"
        actions={
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.75rem', color: 'var(--text3)' }}>
            {requests.filter(r => r.status === 'submitted').length} pending review
          </span>
        }
      />
      <div className="page-body page-enter">
        <div className="filters-bar">
          <input className="form-control search-input"
            placeholder="🔍  Search by victim or location…"
            value={search} onChange={e => setSearch(e.target.value)} />
          <select className="form-control" value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            {STATUSES.map(s => <option key={s} value={s}>{s || 'All Status'}</option>)}
          </select>
          <select className="form-control" value={filters.urgency}
            onChange={e => setFilters(f => ({ ...f, urgency: e.target.value }))}>
            {URGENCIES.map(u => <option key={u} value={u}>{u || 'All Urgency'}</option>)}
          </select>
          <select className="form-control" value={filters.needType}
            onChange={e => setFilters(f => ({ ...f, needType: e.target.value }))}>
            {TYPES.map(t => <option key={t} value={t}>{t || 'All Types'}</option>)}
          </select>
          {(filters.status || filters.urgency || filters.needType || search) && (
            <button className="btn btn-ghost btn-sm"
              onClick={() => { setFilters({ status: '', urgency: '', needType: '' }); setSearch(''); }}>
              ✕ Clear
            </button>
          )}
        </div>

        {loading ? <Loader /> : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🆘</div>
            <p>No victim requests found</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Victim</th>
                  <th>Need</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th>People</th>
                  <th>Location</th>
                  <th>Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r._id}>
                    <td>
                      <strong>{r.victim?.name || '—'}</strong>
                      <div style={{ fontSize: '.72rem', color: 'var(--text3)' }}>{r.victim?.phone || r.victim?.email}</div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{r.needType}</td>
                    <td><Badge value={r.urgency} /></td>
                    <td><Badge value={r.status} /></td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{r.peopleCount}</td>
                    <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.location?.address}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '.72rem', color: 'var(--text3)' }}>
                      {new Date(r.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-xs"
                        onClick={() => setManageItem(r)}>Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {manageItem && (
        <ManageModal
          request={manageItem}
          onClose={() => setManageItem(null)}
          onSuccess={() => { setManageItem(null); load(); }}
        />
      )}
    </>
  );
}

function ManageModal({ request: r, onClose, onSuccess }) {
  const [form, setForm] = useState({
    status:       r.status,
    responseNote: r.responseNote || '',
    linkedRequest: r.linkedRequest?._id || '',
  });
  const [helpRequests, setHelpRequests] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    requestsAPI.getAll().then(({ data }) => setHelpRequests(data.data));
  }, []);

  const submit = async e => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await victimAPI.manage(r._id, form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  return (
    <Modal title="Manage Victim Request" onClose={onClose}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: 4, textTransform: 'capitalize' }}>
          🆘 {r.needType} — {r.victim?.name}
        </div>
        <p style={{ fontSize: '.85rem', color: 'var(--text2)', lineHeight: 1.6 }}>{r.description}</p>
        <div style={{ fontSize: '.75rem', color: 'var(--text3)', marginTop: 6 }}>
          📍 {[r.location?.address, r.location?.area, r.location?.district].filter(Boolean).join(', ')}
          &nbsp;·&nbsp; 👥 {r.peopleCount} people
        </div>
      </div>
      <div className="divider" />
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={submit}>
        <div className="form-group">
          <label className="form-label">Update Status</label>
          <select className="form-control" value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            {['submitted','reviewing','linked','resolved','closed'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Link to Help Request (optional)</label>
          <select className="form-control" value={form.linkedRequest}
            onChange={e => setForm(f => ({ ...f, linkedRequest: e.target.value }))}>
            <option value="">— None —</option>
            {helpRequests.map(hr => (
              <option key={hr._id} value={hr._id}>[{hr.status}] {hr.title}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Message to Victim</label>
          <textarea className="form-control" value={form.responseNote}
            onChange={e => setForm(f => ({ ...f, responseNote: e.target.value }))}
            placeholder="Optional message shown to the victim about their request…" />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Update Request'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
