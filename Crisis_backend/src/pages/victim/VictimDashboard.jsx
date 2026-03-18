import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { victimAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';

const STATUS_INFO = {
  submitted:  { label: 'Submitted',  color: 'var(--yellow)', icon: '⏳', desc: 'Your request has been received and is awaiting review.' },
  reviewing:  { label: 'Reviewing',  color: 'var(--blue)',   icon: '🔍', desc: 'Our team is reviewing your request.' },
  linked:     { label: 'Help Assigned', color: 'var(--accent)', icon: '👤', desc: 'A volunteer has been assigned to help you.' },
  resolved:   { label: 'Resolved',   color: 'var(--green)',  icon: '✅', desc: 'Your request has been resolved.' },
  closed:     { label: 'Closed',     color: 'var(--text3)',  icon: '🔒', desc: 'This request has been closed.' },
};

export default function VictimDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    victimAPI.getMyRequests()
      .then(({ data }) => setRequests(data.data))
      .finally(() => setLoading(false));
  }, []);

  const active   = requests.filter(r => !['resolved','closed'].includes(r.status));
  const resolved = requests.filter(r => r.status === 'resolved');
  const latest   = requests[0];

  return (
    <>
      <PageHeader
        title="My Dashboard"
        subtitle={`Welcome, ${user?.name}. Stay safe.`}
        actions={
          <Link to="/victim/submit" className="btn btn-danger btn-sm"
            style={{ background: 'var(--red)', color: '#fff' }}>
            🆘 New SOS Request
          </Link>
        }
      />
      <div className="page-body page-enter">

        {/* Emergency notice */}
        <div style={{
          background: 'var(--red-bg)', border: '1px solid rgba(244,63,94,.3)',
          borderRadius: 'var(--r2)', padding: '14px 18px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 12
        }}>
          <span style={{ fontSize: '1.4rem' }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--red)', fontSize: '.9rem' }}>
              If this is a life-threatening emergency, call 112 immediately.
            </div>
            <div style={{ fontSize: '.78rem', color: 'var(--text3)', marginTop: 2 }}>
              CrisisConnect coordinates relief operations — for immediate emergencies always call emergency services first.
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
          <div className="stat-card orange">
            <div className="stat-label">Total Requests</div>
            <div className="stat-value">{requests.length}</div>
            <div className="stat-icon">📋</div>
          </div>
          <div className="stat-card yellow">
            <div className="stat-label">Active</div>
            <div className="stat-value">{active.length}</div>
            <div className="stat-icon">⚡</div>
          </div>
          <div className="stat-card green">
            <div className="stat-label">Resolved</div>
            <div className="stat-value">{resolved.length}</div>
            <div className="stat-icon">✅</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Latest request status */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Latest Request Status</div>
              <Link to="/victim/requests" className="btn btn-ghost btn-sm">View all</Link>
            </div>
            {loading ? <Loader /> : !latest ? (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <div className="empty-icon">📭</div>
                <p>No requests yet</p>
                <Link to="/victim/submit" className="btn btn-danger btn-sm"
                  style={{ background: 'var(--red)', color: '#fff', marginTop: 12 }}>
                  Submit SOS →
                </Link>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: 6 }}>{latest.needType?.toUpperCase()} — {latest.description?.slice(0, 80)}...</div>
                  <div style={{ fontSize: '.78rem', color: 'var(--text3)' }}>
                    📍 {latest.location?.address} &nbsp;·&nbsp;
                    {new Date(latest.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </div>

                {/* Status tracker */}
                {['submitted','reviewing','linked','resolved'].map((s, i) => {
                  const info = STATUS_INFO[s];
                  const isDone = ['submitted','reviewing','linked','resolved']
                    .indexOf(latest.status) >= i;
                  return (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: isDone ? 'var(--green-bg)' : 'var(--bg3)',
                        border: `1px solid ${isDone ? 'var(--green)' : 'var(--border)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '.75rem', flexShrink: 0,
                        color: isDone ? 'var(--green)' : 'var(--text3)',
                      }}>
                        {isDone ? '✓' : (i + 1)}
                      </div>
                      <div>
                        <div style={{ fontSize: '.82rem', fontWeight: isDone ? 600 : 400, color: isDone ? 'var(--text)' : 'var(--text3)' }}>
                          {info.icon} {info.label}
                        </div>
                        {latest.status === s && (
                          <div style={{ fontSize: '.72rem', color: 'var(--text3)' }}>{info.desc}</div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {latest.responseNote && (
                  <div style={{
                    background: 'var(--bg3)', border: '1px solid var(--border)',
                    borderRadius: 'var(--r)', padding: '10px 14px', marginTop: 12
                  }}>
                    <div style={{ fontSize: '.7rem', color: 'var(--text3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>
                      Message from team
                    </div>
                    <div style={{ fontSize: '.85rem', color: 'var(--text2)' }}>{latest.responseNote}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick help guide */}
          <div className="card">
            <div className="card-header"><div className="card-title">How to get help</div></div>
            {[
              { step: '1', icon: '📝', title: 'Submit an SOS Request', desc: 'Click "New SOS Request" and describe what you need — food, water, shelter, medical help or rescue.' },
              { step: '2', icon: '🔍', title: 'Team Reviews It', desc: 'Our coordinators review your request and assign it to an available volunteer near you.' },
              { step: '3', icon: '👤', title: 'Volunteer is Assigned', desc: 'A trained volunteer will be dispatched to help you. Track status here in real time.' },
              { step: '4', icon: '✅', title: 'Help Arrives', desc: 'Once resolved, your request will be marked complete. You can submit new requests anytime.' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--red-bg)', border: '1px solid rgba(244,63,94,.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem'
                }}>{s.icon}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '.85rem', marginBottom: 2 }}>{s.title}</div>
                  <div style={{ fontSize: '.78rem', color: 'var(--text3)', lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
