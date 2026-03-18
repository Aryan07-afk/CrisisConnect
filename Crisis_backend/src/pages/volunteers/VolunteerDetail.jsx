import { useState, useEffect } from 'react';
import { volunteersAPI } from '../../api';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';

export default function VolunteerDetail({ volunteerId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    volunteersAPI.getProfile(volunteerId)
      .then(({ data }) => setData(data.data))
      .finally(() => setLoading(false));
  }, [volunteerId]);

  if (loading) return <Loader />;
  if (!data)   return <div className="alert alert-error">Failed to load profile</div>;

  const { volunteer: v, assignedRequests } = data;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: v.isAvailable ? 'var(--green-bg)' : 'var(--yellow-bg)',
          border: `2px solid ${v.isAvailable ? 'var(--green)' : 'var(--yellow)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem',
          color: v.isAvailable ? 'var(--green)' : 'var(--yellow)',
        }}>
          {v.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.1rem', fontWeight: 700 }}>{v.name}</div>
          <div style={{ fontSize: '.78rem', color: 'var(--text3)' }}>{v.email}</div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-item">
          <div className="detail-lbl">Status</div>
          <div className="detail-val" style={{ color: v.isActive ? 'var(--green)' : 'var(--red)' }}>
            {v.isActive ? '● Active' : '● Inactive'}
          </div>
        </div>
        <div className="detail-item">
          <div className="detail-lbl">Availability</div>
          <div className="detail-val" style={{ color: v.isAvailable ? 'var(--green)' : 'var(--yellow)' }}>
            {v.isAvailable ? '● Available' : '● Busy'}
          </div>
        </div>
        <div className="detail-item">
          <div className="detail-lbl">Phone</div>
          <div className="detail-val">{v.phone || '—'}</div>
        </div>
        <div className="detail-item">
          <div className="detail-lbl">Location</div>
          <div className="detail-val">{v.location || '—'}</div>
        </div>
        <div className="detail-item">
          <div className="detail-lbl">Organization</div>
          <div className="detail-val">{v.organization || '—'}</div>
        </div>
        <div className="detail-item">
          <div className="detail-lbl">Joined</div>
          <div className="detail-val">{new Date(v.createdAt).toLocaleDateString('en-IN')}</div>
        </div>
      </div>

      {v.skills?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div className="detail-lbl" style={{ marginBottom: 6 }}>Skills</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {v.skills.map(s => (
              <span key={s} style={{
                padding: '3px 10px', borderRadius: 20, background: 'var(--accent-bg)',
                border: '1px solid rgba(249,115,22,.25)', fontSize: '.75rem',
                color: 'var(--accent)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase'
              }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {assignedRequests?.length > 0 && (
        <>
          <div className="divider" />
          <div style={{ fontSize: '.75rem', color: 'var(--text3)', marginBottom: 10, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
            Assigned Requests ({assignedRequests.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {assignedRequests.map(r => (
              <div key={r._id} style={{
                background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 'var(--r)', padding: '9px 13px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '.85rem', fontWeight: 600 }}>{r.title}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--text3)' }}>
                    {r.requestType} · {r.location?.area || r.location?.address}
                  </div>
                </div>
                <Badge value={r.status} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
