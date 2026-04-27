import { useState, useEffect } from 'react';
import { requestsAPI, volunteersAPI, assignmentsAPI } from '../../api';
import Modal from '../common/Modal';

export default function AssignModal({ initialRequestId, onClose, onSuccess }) {
  const [requests, setRequests] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [form, setForm] = useState({ requestId: initialRequestId || '', volunteerId: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [bestMatches, setBestMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [skillWarning, setSkillWarning] = useState(null);

  useEffect(() => {
    Promise.all([
      requestsAPI.getAll({ status: 'pending' }),
      volunteersAPI.getAll({ isAvailable: 'true' }),
    ]).then(([r, v]) => {
      setRequests(r.data.data.docs || r.data.data);
      setVolunteers(v.data.data);
    });
  }, []);

  useEffect(() => {
    if (!form.requestId) { setBestMatches([]); return; }
    setLoadingMatches(true);
    assignmentsAPI.getBestMatch(form.requestId)
      .then(res => setBestMatches(res.data.data || []))
      .catch(() => setBestMatches([]))
      .finally(() => setLoadingMatches(false));
  }, [form.requestId]);

  const submit = async (e, skipSkillCheck = false) => {
    if (e) e.preventDefault();
    setError(''); setSaving(true); setSkillWarning(null);
    try {
      const res = await assignmentsAPI.create({ ...form, skipSkillCheck });
      // Check for skill-gating warning
      if (res.data?.data?.warning && res.data?.data?.requiresConfirmation) {
        setSkillWarning(res.data.message);
        setSaving(false);
        return;
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Assignment failed');
    } finally { setSaving(false); }
  };

  return (
    <Modal title="Assign Volunteer to Request" onClose={onClose}>
      {/* Skill mismatch warning dialog */}
      {skillWarning ? (
        <div>
          <div style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning-br)', padding: '16px', borderRadius: 'var(--r-md)', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--warning)', fontSize: '20px', flexShrink: 0, marginTop: '2px' }}>warning</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--t1)', marginBottom: '6px' }}>Skill Mismatch Warning</div>
                <div style={{ fontSize: '13px', color: 'var(--t2)', lineHeight: 1.5 }}>{skillWarning}</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button className="btn-ghost" onClick={() => setSkillWarning(null)}>Go Back</button>
            <button className="btn-danger" onClick={() => submit(null, true)} disabled={saving}>
              {saving ? 'Assigning…' : 'Assign Anyway →'}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit}>
          {error && <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 'var(--r-md)', marginBottom: '16px', fontSize: '13px' }}>{error}</div>}

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--t2)', marginBottom: '6px' }}>Pending Request *</label>
            <select className="form-control" value={form.requestId} onChange={e => setForm(f => ({ ...f, requestId: e.target.value }))} required>
              <option value="">— Select request —</option>
              {requests.map(r => (
                <option key={r._id} value={r._id}>[{r.priority?.toUpperCase()}] {r.title}</option>
              ))}
            </select>
          </div>

          {form.requestId && (
            <div style={{ background: 'var(--neutral-bg)', padding: '16px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--t2)' }}>⭐ Recommended Matches</span>
                {loadingMatches && <span style={{ fontSize: '11px', color: 'var(--t4)' }}>Loading…</span>}
              </div>
              {!loadingMatches && bestMatches.length === 0 && (
                <div style={{ fontSize: '12px', color: 'var(--t4)' }}>No specific matches found.</div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {bestMatches.map((m) => (
                  <div key={m.volunteer._id}
                    onClick={() => setForm(f => ({ ...f, volunteerId: m.volunteer._id }))}
                    style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: form.volunteerId === m.volunteer._id ? 'var(--brand-bg)' : 'var(--surface)', border: `1px solid ${form.volunteerId === m.volunteer._id ? 'var(--brand)' : 'var(--border)'}`, borderRadius: 'var(--r-sm)', cursor: 'pointer' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t1)' }}>{m.volunteer.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--t4)' }}>{m.volunteer.skills?.join(', ') || 'General'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--success)' }}>Score: {Math.round(m.score)}</div>
                      <div style={{ fontSize: '11px', color: 'var(--t3)' }}>{m.distanceKm !== null ? `${m.distanceKm.toFixed(1)} km` : 'Unknown'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--t2)', marginBottom: '6px' }}>Available Volunteer *</label>
            <select className="form-control" value={form.volunteerId} onChange={e => setForm(f => ({ ...f, volunteerId: e.target.value }))} required>
              <option value="">— Select volunteer —</option>
              {volunteers.map(v => (
                <option key={v._id} value={v._id}>{v.name} ({v.skills?.join(', ') || 'general'})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving || !form.requestId || !form.volunteerId}>
              {saving ? 'Assigning…' : 'Assign →'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
