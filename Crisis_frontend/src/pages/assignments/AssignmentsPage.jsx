import { useState, useEffect, useCallback } from 'react';
import { assignmentsAPI, requestsAPI, volunteersAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import Badge, { PriorityDot } from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import AssignModal from '../../components/modals/AssignModal';

const STATUSES = ['', 'assigned', 'accepted', 'in_progress', 'completed', 'rejected'];

export default function AssignmentsPage() {
  const { isVolunteer, canManage } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showAssign, setShowAssign] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = isVolunteer
        ? await assignmentsAPI.getMy()
        : await assignmentsAPI.getAll(filter ? { status: filter } : {});
      setAssignments(data.data.docs || data.data);
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
    if (!window.confirm('Cancel this assignment?')) return;
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
      assigned: [{ label: 'Accept', status: 'accepted', cls: 'success' },
      { label: 'Reject', status: 'rejected', cls: 'danger' }],
      accepted: [{ label: 'Start', status: 'in_progress', cls: 'primary' }],
      in_progress: [{ label: 'Complete', status: 'completed', cls: 'success' }],
    };
    return map[status] || [];
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>Assignments</h1>
          <p>{isVolunteer ? 'Your assigned relief tasks' : 'Manage volunteer-request assignments'}</p>
        </div>
        {canManage && (
          <div className="topbar-right">
            <button className="btn-primary" onClick={() => setShowAssign(true)}>
              + Assign Volunteer
            </button>
          </div>
        )}
      </div>

      <div className="page-body page-enter">
        {error && <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-br)', padding: '12px 16px', borderRadius: 'var(--r-md)' }}>{error}</div>}

        <div className="filter-strip">
          <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: 'var(--t4)' }}>search</span>
            <input
              className="form-control"
              style={{ paddingLeft: '36px' }}
              placeholder="Search request or volunteer…"
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="form-control" style={{ width: 'fit-content', minWidth: '140px' }} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {(filter || search) && (
            <button className="btn-ghost" style={{ padding: '6px 12px' }} onClick={() => { setFilter(''); setSearch(''); }}>
              ✕ Clear
            </button>
          )}
        </div>

        {loading ? <div style={{ padding: '60px 0' }}><Loader /></div> : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--t4)', marginBottom: '16px' }}>assignment</span>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--t1)', marginBottom: '6px' }}>No assignments found</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map(a => (
              <div key={a._id} className="card" style={{ padding: '16px 20px', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

                {/* Left: Request Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    {a.request?.priority && <div className={`priority-dot ${a.request.priority}`} />}
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--t1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {a.request?.title || 'Unknown Request'}
                    </div>
                    <Badge value={a.status} />
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '12px', color: 'var(--t3)' }}>
                    {a.request?.requestType && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>label</span>
                        <span style={{ textTransform: 'capitalize' }}>{a.request.requestType}</span>
                      </div>
                    )}
                    {a.request?.location?.area && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>pin_drop</span>
                        {a.request.location.area}
                      </div>
                    )}
                    {!isVolunteer && a.volunteer?.name && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>person</span>
                        {a.volunteer.name}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>event</span>
                      {new Date(a.createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>

                  {a.remarks && (
                    <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--t4)', fontStyle: 'italic', background: 'var(--neutral-bg)', padding: '6px 10px', borderRadius: 'var(--r-sm)' }}>
                      "{a.remarks}"
                    </div>
                  )}
                </div>

                {/* Right: Timeline & Actions */}
                <div style={{ width: '320px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>

                  <div className="tracker-stepper" style={{ marginBottom: '16px', width: '100%', padding: 0 }}>
                    <div className="tracker-line" style={{ left: '20px', right: '20px' }} />
                    <div className="tracker-line tracker-line-fill" style={{ left: '20px', right: '20px', width: ['completed'].includes(a.status) ? '100%' : ['in_progress'].includes(a.status) ? '66%' : ['accepted'].includes(a.status) ? '33%' : '0%' }} />

                    {[
                      { id: 'assigned', label: 'Assigned', done: true },
                      { id: 'accepted', label: 'Accepted', done: !!a.acceptedAt },
                      { id: 'in_progress', label: 'Started', done: ['in_progress', 'completed'].includes(a.status) },
                      { id: 'completed', label: 'Done', done: a.status === 'completed' }
                    ].map((step, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', flex: 1 }}>
                        <div className={`tracker-node ${step.done ? 'done' : 'future'}`} style={{ width: '18px', height: '18px', fontSize: '10px', marginBottom: '4px' }}>
                          {step.done ? <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>check</span> : (i + 1)}
                        </div>
                        <div style={{ fontSize: '10px', color: step.done ? 'var(--t2)' : 'var(--t4)', fontWeight: step.done ? 600 : 400 }}>
                          {step.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {(isVolunteer || canManage) && nextActions(a.status).map(action => (
                      <button
                        key={action.status}
                        className={`btn-${action.cls}`}
                        style={{ padding: '6px 14px', fontSize: '12px' }}
                        disabled={actionLoading === a._id + action.status}
                        onClick={() => updateStatus(a._id, action.status)}
                      >
                        {actionLoading === a._id + action.status ? '...' : action.label}
                      </button>
                    ))}
                    {canManage && !['completed', 'rejected'].includes(a.status) && (
                      <button className="btn-ghost danger" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={() => deleteAssignment(a._id)}>
                        Cancel
                      </button>
                    )}
                  </div>
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


