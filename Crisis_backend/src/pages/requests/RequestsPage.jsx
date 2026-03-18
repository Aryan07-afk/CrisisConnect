import { useState, useEffect, useCallback } from 'react';
import { requestsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/layout/PageHeader';
import Badge, { PriorityDot } from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import RequestForm from './RequestForm';
import RequestDetail from './RequestDetail';

const STATUSES  = ['','pending','assigned','in_progress','resolved','cancelled'];
const PRIORITIES= ['','critical','high','medium','low'];
const TYPES     = ['','food','water','shelter','medical','rescue','clothing','other'];

export default function RequestsPage() {
  const { canManage, isVolunteer } = useAuth();
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filters, setFilters]     = useState({ status:'', priority:'', requestType:'' });
  const [search, setSearch]       = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [viewItem, setViewItem]   = useState(null);
  const [error, setError]         = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status)      params.status      = filters.status;
      if (filters.priority)    params.priority    = filters.priority;
      if (filters.requestType) params.requestType = filters.requestType;
      const { data } = await requestsAPI.getAll(params);
      setRequests(data.data);
    } catch (e) { setError('Failed to load requests'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this request?')) return;
    try { await requestsAPI.delete(id); load(); }
    catch (e) { alert(e.response?.data?.message || 'Delete failed'); }
  };

  const filtered = requests.filter(r =>
    !search ||
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.location?.address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <PageHeader
        title="Help Requests"
        subtitle="Manage all disaster relief requests"
        actions={
          <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowForm(true); }}>
            + New Request
          </button>
        }
      />
      <div className="page-body page-enter">
        {error && <div className="alert alert-error">{error}</div>}

        {/* Filters */}
        <div className="filters-bar">
          <input
            className="form-control search-input"
            placeholder="🔍  Search by title or location…"
            value={search} onChange={e => setSearch(e.target.value)}
          />
          <select className="form-control" value={filters.status}
            onChange={e => setFilters(f=>({...f,status:e.target.value}))}>
            {STATUSES.map(s => <option key={s} value={s}>{s||'All Status'}</option>)}
          </select>
          <select className="form-control" value={filters.priority}
            onChange={e => setFilters(f=>({...f,priority:e.target.value}))}>
            {PRIORITIES.map(p => <option key={p} value={p}>{p||'All Priority'}</option>)}
          </select>
          <select className="form-control" value={filters.requestType}
            onChange={e => setFilters(f=>({...f,requestType:e.target.value}))}>
            {TYPES.map(t => <option key={t} value={t}>{t||'All Types'}</option>)}
          </select>
          {(filters.status||filters.priority||filters.requestType||search) && (
            <button className="btn btn-ghost btn-sm"
              onClick={()=>{setFilters({status:'',priority:'',requestType:''});setSearch('');}}>
              ✕ Clear
            </button>
          )}
        </div>

        {loading ? <Loader /> : (
          filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>No requests found</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Affected</th>
                    <th>Raised By</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r._id}>
                      <td>
                        <strong>
                          <PriorityDot priority={r.priority} />
                          {r.title}
                        </strong>
                      </td>
                      <td><span style={{textTransform:'capitalize', color:'var(--text2)'}}>{r.requestType}</span></td>
                      <td><Badge value={r.priority} /></td>
                      <td><Badge value={r.status} /></td>
                      <td style={{maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                        {r.location?.area || r.location?.address}
                      </td>
                      <td style={{fontFamily:'var(--font-mono)', color:'var(--text2)'}}>{r.affectedCount}</td>
                      <td>{r.raisedBy?.name || '—'}</td>
                      <td style={{fontFamily:'var(--font-mono)', fontSize:'.75rem', color:'var(--text3)'}}>
                        {new Date(r.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        <div style={{display:'flex', gap:6}}>
                          <button className="btn btn-ghost btn-xs"
                            onClick={() => setViewItem(r)}>View</button>
                          <button className="btn btn-ghost btn-xs"
                            onClick={() => { setEditItem(r); setShowForm(true); }}>Edit</button>
                          <button className="btn btn-danger btn-xs"
                            onClick={() => handleDelete(r._id)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Create / Edit Modal */}
      {showForm && (
        <Modal
          title={editItem ? 'Edit Request' : 'New Help Request'}
          onClose={() => { setShowForm(false); setEditItem(null); }}
        >
          <RequestForm
            initial={editItem}
            onSuccess={() => { setShowForm(false); setEditItem(null); load(); }}
            onCancel={() => { setShowForm(false); setEditItem(null); }}
          />
        </Modal>
      )}

      {/* Detail Modal */}
      {viewItem && (
        <Modal title="Request Details" onClose={() => setViewItem(null)}>
          <RequestDetail
            requestId={viewItem._id}
            canManage={canManage}
            onClose={() => setViewItem(null)}
            onUpdate={load}
          />
        </Modal>
      )}
    </>
  );
}
