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

  if (loading) return <div style={{ padding: '60px 0' }}><Loader /></div>;
  if (!data)   return <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-br)', padding: '12px 16px', borderRadius: 'var(--r-md)' }}>Failed to load profile</div>;

  const { volunteer: v, assignedRequests } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Profile Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: 'var(--surface)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: v.isAvailable ? 'var(--success-bg)' : 'var(--warning-bg)',
          border: `2px solid ${v.isAvailable ? 'var(--success)' : 'var(--warning)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px', fontWeight: 800, color: v.isAvailable ? 'var(--success)' : 'var(--warning)',
          boxShadow: `0 4px 12px ${v.isAvailable ? 'rgba(22, 163, 74, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
        }}>
          {v.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--t1)', marginBottom: '4px' }}>{v.name}</div>
          <div style={{ fontSize: '13px', color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>mail</span>
            {v.email}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div style={{ background: 'var(--neutral-bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Account Status</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: v.isActive ? 'var(--success)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div className={`priority-dot ${v.isActive ? 'low' : 'critical'}`} style={{ width: '8px', height: '8px' }} />
            {v.isActive ? 'Active' : 'Inactive'}
          </div>
        </div>
        <div style={{ background: 'var(--neutral-bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Availability</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: v.isAvailable ? 'var(--success)' : 'var(--warning)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div className={`priority-dot ${v.isAvailable ? 'low' : 'medium'}`} style={{ width: '8px', height: '8px' }} />
            {v.isAvailable ? 'Available' : 'Busy'}
          </div>
        </div>
        <div style={{ background: 'var(--neutral-bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Phone</div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--t1)' }}>{v.phone || '—'}</div>
        </div>
        <div style={{ background: 'var(--neutral-bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Organization</div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--t1)' }}>{v.organization || '—'}</div>
        </div>
        <div style={{ background: 'var(--neutral-bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '16px', gridColumn: '1 / -1' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Location</div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--t1)' }}>{v.location || '—'}</div>
        </div>
      </div>

      {/* Skills */}
      {v.skills?.length > 0 && (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--t2)', marginBottom: '10px' }}>Specialized Skills</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {v.skills.map(s => (
              <span key={s} style={{
                padding: '6px 12px', borderRadius: 'var(--r-xl)', background: 'var(--brand-bg)',
                border: '1px solid var(--brand-br)', fontSize: '12px', fontWeight: 600,
                color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.05em'
              }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Assigned Requests */}
      {assignedRequests?.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--neutral-bg)', fontSize: '13px', fontWeight: 600, color: 'var(--t2)' }}>
            Active Assignments ({assignedRequests.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {assignedRequests.map((r, i) => (
              <div key={r._id} style={{
                padding: '16px 20px',
                borderBottom: i !== assignedRequests.length - 1 ? '1px solid var(--border)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'background .2s'
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--t1)', marginBottom: '4px' }}>{r.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ textTransform: 'capitalize' }}>{r.requestType}</span>
                    <span>·</span>
                    <span>{r.location?.area || r.location?.address}</span>
                  </div>
                </div>
                <Badge value={r.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
