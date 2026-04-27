import { useState, useEffect, useCallback } from 'react';
import { victimAPI, requestsAPI } from '../../api';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';

const STATUS_COLORS = {
  submitted: { bg: 'var(--danger-bg)', color: 'var(--danger)', br: 'var(--danger-br)' },
  reviewing: { bg: 'var(--warning-bg)', color: 'var(--warning)', br: 'var(--warning-br)' },
  linked:    { bg: 'var(--info-bg)', color: 'var(--info)', br: 'var(--info-br)' },
  resolved:  { bg: 'var(--success-bg)', color: 'var(--success)', br: 'var(--success-br)' },
  closed:    { bg: 'var(--neutral-bg)', color: 'var(--t3)', br: 'var(--border)' }
};

const URGENCY_COLORS = {
  critical: { bg: 'var(--danger-bg)', color: 'var(--danger)', br: 'var(--danger-br)', icon: 'warning' },
  high:     { bg: 'var(--warning-bg)', color: 'var(--warning)', br: 'var(--warning-br)', icon: 'priority_high' },
  medium:   { bg: 'var(--info-bg)', color: 'var(--info)', br: 'var(--info-br)', icon: 'drag_handle' },
  low:      { bg: 'var(--success-bg)', color: 'var(--success)', br: 'var(--success-br)', icon: 'low_priority' }
};

const STATUSES  = ['submitted', 'reviewing', 'linked', 'resolved', 'closed'];
const URGENCIES = ['critical', 'high', 'medium', 'low'];
const TYPES     = ['food', 'water', 'shelter', 'medical', 'rescue', 'clothing', 'other'];

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
      setRequests(data.data.docs);
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
      <div className="topbar">
        <div className="topbar-left">
          <h1>Victim Requests</h1>
          <p>Direct SOS requests submitted by victims</p>
        </div>
      </div>
      
      <div className="page-body page-enter">
        <div className="filter-strip">
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="form-group" style={{ margin: 0, width: '240px' }}>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: 'var(--t4)' }}>search</span>
                <input 
                  className="form-control" 
                  style={{ paddingLeft: '36px', height: '36px' }} 
                  placeholder="Search victim or location..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                />
              </div>
            </div>
            
            <select className="form-control" style={{ width: '140px', height: '36px' }} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            
            <select className="form-control" style={{ width: '140px', height: '36px' }} value={filters.urgency} onChange={e => setFilters(f => ({ ...f, urgency: e.target.value }))}>
              <option value="">All Urgencies</option>
              {URGENCIES.map(u => <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>)}
            </select>
            
            <select className="form-control" style={{ width: '140px', height: '36px' }} value={filters.needType} onChange={e => setFilters(f => ({ ...f, needType: e.target.value }))}>
              <option value="">All Need Types</option>
              {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
            
            {(filters.status || filters.urgency || filters.needType || search) && (
              <button className="btn-ghost" style={{ padding: '6px 12px', height: '36px' }} onClick={() => { setFilters({ status: '', urgency: '', needType: '' }); setSearch(''); }}>
                Clear Filters
              </button>
            )}
          </div>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div style={{ padding: '60px 0' }}><Loader /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--t4)', marginBottom: '16px' }}>sos</span>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--t1)', marginBottom: '6px' }}>No victim requests found</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ minWidth: '900px' }}>
                <thead>
                  <tr>
                    <th>Victim Details</th>
                    <th>Type & Urgency</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Submitted</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => {
                    const statusConfig = STATUS_COLORS[r.status] || STATUS_COLORS.submitted;
                    const urgencyConfig = URGENCY_COLORS[r.urgency] || URGENCY_COLORS.low;
                    
                    return (
                      <tr key={r._id}>
                        <td>
                          <div className="td-primary">{r.victim?.name || '—'}</div>
                          <div className="td-secondary">{r.victim?.phone || r.victim?.email}</div>
                          <div style={{ fontSize: '11px', color: 'var(--t4)', marginTop: '4px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '12px', verticalAlign: 'middle', marginRight: '2px' }}>group</span>
                            {r.peopleCount} people
                          </div>
                        </td>
                        <td>
                          <div className="td-primary" style={{ textTransform: 'capitalize', marginBottom: '4px' }}>{r.needType}</div>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 6px', borderRadius: 'var(--r-xs)', fontSize: '11px', fontWeight: 600, background: urgencyConfig.bg, color: urgencyConfig.color, border: `1px solid ${urgencyConfig.br}`, textTransform: 'uppercase' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>{urgencyConfig.icon}</span>
                            {r.urgency}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 'var(--r-xs)', fontSize: '11px', fontWeight: 600, background: statusConfig.bg, color: statusConfig.color, border: `1px solid ${statusConfig.br}`, textTransform: 'capitalize' }}>
                            {r.status}
                          </div>
                        </td>
                        <td>
                          <div className="td-secondary" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {r.location?.address}
                          </div>
                        </td>
                        <td>
                          <div className="td-primary">{new Date(r.createdAt).toLocaleDateString('en-IN')}</div>
                          <div className="td-secondary">{new Date(r.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setManageItem(r)}>
                            Manage
                          </button>
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
    requestsAPI.getAll().then(({ data }) => setHelpRequests(data.data.docs || data.data || []));
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

  const urgencyConfig = URGENCY_COLORS[r.urgency] || URGENCY_COLORS.low;

  return (
    <Modal title="Manage Victim Request" onClose={onClose}>
      <div style={{ marginBottom: '24px', background: 'var(--neutral-bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--t1)', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--brand)', fontSize: '18px' }}>emergency</span>
              {r.needType} — {r.victim?.name}
            </div>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 6px', borderRadius: 'var(--r-xs)', fontSize: '11px', fontWeight: 600, background: urgencyConfig.bg, color: urgencyConfig.color, border: `1px solid ${urgencyConfig.br}`, textTransform: 'uppercase' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>{urgencyConfig.icon}</span>
            {r.urgency}
          </div>
        </div>
        
        <p style={{ fontSize: '13px', color: 'var(--t2)', lineHeight: 1.5, marginBottom: '12px' }}>
          {r.description || 'No description provided.'}
        </p>
        
        <div style={{ fontSize: '12px', color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
            {[r.location?.address, r.location?.area, r.location?.district].filter(Boolean).join(', ')}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>group</span>
            {r.peopleCount} people
          </span>
        </div>
      </div>
      
      {error && <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-br)', padding: '10px 14px', borderRadius: 'var(--r-md)', marginBottom: '16px', fontSize: '13px' }}>{error}</div>}
      
      <form onSubmit={submit}>
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--t2)', marginBottom: '6px' }}>Update Status</label>
          <select className="form-control" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            {STATUSES.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--t2)', marginBottom: '6px' }}>Link to Help Request (Optional)</label>
          <select className="form-control" value={form.linkedRequest} onChange={e => setForm(f => ({ ...f, linkedRequest: e.target.value }))}>
            <option value="">— None —</option>
            {helpRequests.map(hr => (
              <option key={hr._id} value={hr._id}>[{hr.status}] {hr.title}</option>
            ))}
          </select>
          <div style={{ fontSize: '11px', color: 'var(--t4)', marginTop: '4px' }}>Links this victim's SOS to an active public request operation.</div>
        </div>
        
        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--t2)', marginBottom: '6px' }}>Message to Victim</label>
          <textarea 
            className="form-control" 
            rows={3}
            value={form.responseNote}
            onChange={e => setForm(f => ({ ...f, responseNote: e.target.value }))}
            placeholder="Optional message shown to the victim about their request…" 
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Update Request'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
