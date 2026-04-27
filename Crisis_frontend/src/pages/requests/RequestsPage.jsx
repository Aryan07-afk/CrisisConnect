import { useState, useEffect, useCallback } from 'react';
import { requestsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import Badge, { PriorityDot } from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import RequestForm from './RequestForm';
import RequestDetail from './RequestDetail';

const STATUSES  = ['','pending','assigned','in_progress','resolved','cancelled'];
const PRIORITIES= ['','critical','high','medium','low'];
const TYPES     = ['','food','water','shelter','medical','rescue','clothing','other'];

export default function RequestsPage() {
  const { canManage } = useAuth();
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
      setRequests(data.data.docs || data.data);
    } catch (e) { setError('Failed to load requests'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this request?')) return;
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
      <div className="topbar">
        <div className="topbar-left">
          <h1>Help Requests</h1>
          <p>Manage all disaster relief requests</p>
        </div>
        <div className="topbar-right">
          <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowForm(true); }}>
            + New Request
          </button>
        </div>
      </div>
      
      <div className="page-body page-enter">
        {error && <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-br)', padding: '12px 16px', borderRadius: 'var(--r-md)' }}>{error}</div>}

        {/* Filter Strip */}
        <div className="filter-strip">
          <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: 'var(--t4)' }}>search</span>
            <input
              className="form-control"
              style={{ paddingLeft: '36px' }}
              placeholder="Search title or location…"
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="form-control" style={{ width: 'fit-content', minWidth: '140px' }} value={filters.status} onChange={e => setFilters(f=>({...f,status:e.target.value}))}>
            <option value="">All Statuses</option>
            {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="form-control" style={{ width: 'fit-content', minWidth: '140px' }} value={filters.priority} onChange={e => setFilters(f=>({...f,priority:e.target.value}))}>
            <option value="">All Priorities</option>
            {PRIORITIES.filter(Boolean).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="form-control" style={{ width: 'fit-content', minWidth: '140px' }} value={filters.requestType} onChange={e => setFilters(f=>({...f,requestType:e.target.value}))}>
            <option value="">All Types</option>
            {TYPES.filter(Boolean).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="results-count">Showing {filtered.length} of {requests.length}</div>
        </div>

        {/* Table Card */}
        <div className="table-wrapper">
          {loading ? (
            <div style={{ padding: '60px 0' }}><Loader /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--t4)', marginBottom: '16px' }}>inbox</span>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--t1)', marginBottom: '6px' }}>No requests found</div>
              <div style={{ fontSize: '13px', color: 'var(--t3)' }}>Try adjusting your filters or search terms.</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 220px)' }}>
              <table style={{ minWidth: '800px' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr>
                    <th>Title & Location</th>
                    <th>Type</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Affected</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r._id}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className={`priority-dot ${r.priority}`} />
                        <div>
                          <div className="td-primary">{r.title}</div>
                          <div className="td-secondary">{r.location?.area || r.location?.address}</div>
                        </div>
                      </td>
                      <td><span style={{ textTransform: 'capitalize', fontSize: '13px', color: 'var(--t2)' }}>{r.requestType}</span></td>
                      <td><Badge value={r.priority} /></td>
                      <td><Badge value={r.status} /></td>
                      <td><div className="td-primary">{r.affectedCount}</div></td>
                      <td>
                        <div className="td-primary">{new Date(r.createdAt).toLocaleDateString('en-IN')}</div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                          <button className="btn-icon" onClick={() => setViewItem(r)} title="View">
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
                          </button>
                          <button className="btn-icon" onClick={() => { setEditItem(r); setShowForm(true); }} title="Edit">
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                          </button>
                          {canManage && (
                            <button className="btn-icon danger" onClick={() => handleDelete(r._id)} title="Delete">
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

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
