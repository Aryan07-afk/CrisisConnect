import { useState, useEffect } from 'react';
import { requestsAPI } from '../../api';
import Badge, { PriorityDot } from '../../components/common/Badge';
import Loader from '../../components/common/Loader';

export default function RequestDetail({ requestId, onClose, onUpdate }) {
  const [req, setReq]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote]   = useState('');
  const [posting, setPosting] = useState(false);
  const [err, setErr]     = useState('');

  useEffect(() => {
    requestsAPI.getById(requestId)
      .then(({ data }) => setReq(data.data))
      .finally(() => setLoading(false));
  }, [requestId]);

  const addNote = async () => {
    if (!note.trim()) return;
    setPosting(true);
    try {
      await requestsAPI.addNote(requestId, { message: note });
      setNote('');
      const { data } = await requestsAPI.getById(requestId);
      setReq(data.data);
      onUpdate?.();
    } catch (e) { setErr('Failed to add note'); }
    finally { setPosting(false); }
  };

  if (loading) return <div style={{ padding: '60px 0' }}><Loader /></div>;
  if (!req)    return <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-br)', padding: '12px 16px', borderRadius: 'var(--r-md)' }}>Failed to load request</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ marginTop: '6px' }}><PriorityDot priority={req.priority} /></div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--t1)', marginBottom: '6px', lineHeight: 1.3 }}>{req.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--t3)', lineHeight: 1.6, maxWidth: '480px' }}>{req.description}</p>
            </div>
          </div>
          <Badge value={req.status} />
        </div>
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ padding: '6px 12px', background: 'var(--neutral-bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: '12px', fontWeight: 600, color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--t4)' }}>category</span>
            <span style={{ textTransform: 'capitalize' }}>{req.requestType}</span>
          </div>
          <div style={{ padding: '6px 12px', background: 'var(--neutral-bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: '12px', fontWeight: 600, color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--t4)' }}>group</span>
            {req.affectedCount} Affected
          </div>
        </div>
      </div>

      {/* Grid Info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div style={{ background: 'var(--neutral-bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Raised By</div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--t1)' }}>{req.raisedBy?.name || '—'}</div>
        </div>
        <div style={{ background: 'var(--neutral-bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Assigned To</div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--t1)' }}>{req.assignedTo?.name || 'Unassigned'}</div>
        </div>
        <div style={{ background: 'var(--neutral-bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '16px', gridColumn: '1 / -1' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Location</div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--t4)' }}>pin_drop</span>
            {[req.location?.address, req.location?.area, req.location?.district, req.location?.state].filter(Boolean).join(', ')}
            {req.location?.pincode ? ` — ${req.location.pincode}` : ''}
          </div>
        </div>
      </div>

      {/* Timeline / Notes */}
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t2)', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Activity Log ({req.notes?.length || 0})</span>
        </div>

        {req.notes?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {req.notes.map((n, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--brand-bg)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
                  {n.author?.name ? n.author.name[0].toUpperCase() : 'U'}
                </div>
                <div style={{ flex: 1, background: 'var(--neutral-bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--t1)' }}>{n.author?.name || 'Unknown'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--t4)' }}>{new Date(n.createdAt).toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--t2)', lineHeight: 1.5 }}>{n.message}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', background: 'var(--neutral-bg)', border: '1px dashed var(--border)', borderRadius: 'var(--r-md)', fontSize: '13px', color: 'var(--t4)', marginBottom: '20px' }}>
            No activity notes yet.
          </div>
        )}

        {err && <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-br)', padding: '10px 14px', borderRadius: 'var(--r-md)', marginBottom: '12px', fontSize: '12px' }}>{err}</div>}
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            className="form-control"
            style={{ flex: 1 }}
            placeholder="Add a new update or note..."
            value={note}
            onChange={e => setNote(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addNote()}
          />
          <button className="btn btn-primary" onClick={addNote} disabled={posting || !note.trim()}>
            {posting ? 'Posting...' : 'Post Update'}
          </button>
        </div>
      </div>
    </div>
  );
}
