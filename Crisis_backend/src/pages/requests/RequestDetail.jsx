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

  if (loading) return <Loader />;
  if (!req)    return <div className="alert alert-error">Failed to load request</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <PriorityDot priority={req.priority} />
        <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.05rem', fontWeight: 700 }}>{req.title}</h3>
      </div>

      <p style={{ fontSize: '.88rem', color: 'var(--text2)', marginBottom: 16, lineHeight: 1.6 }}>{req.description}</p>

      <div className="detail-grid">
        <div className="detail-item">
          <div className="detail-lbl">Type</div>
          <div className="detail-val" style={{ textTransform: 'capitalize' }}>{req.requestType}</div>
        </div>
        <div className="detail-item">
          <div className="detail-lbl">Priority</div>
          <div className="detail-val"><Badge value={req.priority} /></div>
        </div>
        <div className="detail-item">
          <div className="detail-lbl">Status</div>
          <div className="detail-val"><Badge value={req.status} /></div>
        </div>
        <div className="detail-item">
          <div className="detail-lbl">Affected</div>
          <div className="detail-val" style={{ fontFamily: 'var(--font-mono)' }}>{req.affectedCount} people</div>
        </div>
        <div className="detail-item">
          <div className="detail-lbl">Raised By</div>
          <div className="detail-val">{req.raisedBy?.name || '—'}</div>
        </div>
        <div className="detail-item">
          <div className="detail-lbl">Assigned To</div>
          <div className="detail-val">{req.assignedTo?.name || 'Unassigned'}</div>
        </div>
      </div>

      <div className="detail-item" style={{ marginBottom: 16 }}>
        <div className="detail-lbl">Location</div>
        <div className="detail-val">
          {[req.location?.address, req.location?.area, req.location?.district, req.location?.state]
            .filter(Boolean).join(', ')}
          {req.location?.pincode ? ` — ${req.location.pincode}` : ''}
        </div>
      </div>

      {req.resolvedAt && (
        <div className="detail-item" style={{ marginBottom: 16 }}>
          <div className="detail-lbl">Resolved At</div>
          <div className="detail-val">{new Date(req.resolvedAt).toLocaleString('en-IN')}</div>
        </div>
      )}

      {/* Notes */}
      <div className="divider" />
      <div style={{ fontSize: '.75rem', color: 'var(--text3)', marginBottom: 10, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
        Activity Notes ({req.notes?.length || 0})
      </div>

      {req.notes?.length > 0 && (
        <div className="notes-list">
          {req.notes.map((n, i) => (
            <div key={i} className="note-item">
              <div className="note-meta">
                {n.author?.name || 'Unknown'} &nbsp;·&nbsp;
                {new Date(n.createdAt).toLocaleString('en-IN')}
              </div>
              <div className="note-msg">{n.message}</div>
            </div>
          ))}
        </div>
      )}

      {err && <div className="alert alert-error">{err}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="form-control"
          placeholder="Add a note…"
          value={note}
          onChange={e => setNote(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addNote()}
        />
        <button className="btn btn-primary btn-sm" onClick={addNote} disabled={posting || !note.trim()}>
          {posting ? '…' : 'Add'}
        </button>
      </div>
    </div>
  );
}
