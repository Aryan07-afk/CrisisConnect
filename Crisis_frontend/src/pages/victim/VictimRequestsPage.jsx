import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { victimAPI } from '../../api';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';

const STATUS_ICON = {
  submitted: '⏳', reviewing: '🔍', linked: '👤', resolved: '✅', closed: '🔒'
};

export default function VictimRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const load = () => {
    setLoading(true);
    victimAPI.getMyRequests()
      .then(({ data }) => setRequests(data.data.docs))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!confirm('Cancel this request?')) return;
    setCancelling(id);
    try { await victimAPI.cancelRequest(id); load(); }
    catch (e) { alert(e.response?.data?.message || 'Failed to cancel'); }
    finally { setCancelling(null); }
  };

  return (
    <>
      <PageHeader
        title="My Requests"
        subtitle="All your submitted help requests"
        actions={
          <Link to="/victim/submit" className="btn btn-sm"
            style={{ background: 'var(--danger)', color: '#fff', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '20px' }}>🆘</span> New SOS
          </Link>
        }
      />
      <div className="page-body page-enter">
        {loading ? <Loader /> : requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>You haven't submitted any requests yet</p>
            <Link to="/victim/submit" className="btn btn-sm"
              style={{ background: 'var(--danger)', color: '#fff', marginTop: 14 }}>
              Submit SOS Request →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {requests.map(r => (
              <div key={r._id} className="card" style={{ padding: '18px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: '1.1rem' }}>{STATUS_ICON[r.status]}</span>
                      <span style={{ fontWeight: 700, fontSize: '.95rem', textTransform: 'capitalize' }}>
                        {r.needType} Request
                      </span>
                      <Badge value={r.urgency} type={r.urgency} />
                      <Badge value={r.status} />
                    </div>
                    <p style={{ fontSize: '.85rem', color: 'var(--text2)', lineHeight: 1.6 }}>
                      {r.description?.slice(0, 120)}{r.description?.length > 120 ? '…' : ''}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: '.78rem', color: 'var(--text3)', marginBottom: 12 }}>
                  <span>📍 {r.location?.address}{r.location?.area ? `, ${r.location.area}` : ''}</span>
                  <span>👥 {r.peopleCount} {r.peopleCount === 1 ? 'person' : 'people'}</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>
                    {new Date(r.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 0, height: 4, borderRadius: 2, overflow: 'hidden', background: 'var(--bg4)' }}>
                    {['submitted','reviewing','linked','resolved'].map((s, i) => {
                      const steps = ['submitted','reviewing','linked','resolved'];
                      const current = steps.indexOf(r.status);
                      const filled = i <= current && r.status !== 'closed';
                      return (
                        <div key={s} style={{
                          flex: 1, marginRight: i < 3 ? 2 : 0,
                          background: filled ? 'var(--green)' : 'var(--bg4)',
                          borderRadius: 2,
                          transition: 'background .3s'
                        }} />
                      );
                    })}
                  </div>
                  <div style={{ fontSize: '.68rem', color: 'var(--text3)', marginTop: 4, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    {r.status === 'closed' ? 'Closed' : `Step ${Math.min(['submitted','reviewing','linked','resolved'].indexOf(r.status) + 1, 4)} of 4`}
                  </div>
                </div>

                {/* Response note from coordinator */}
                {r.responseNote && (
                  <div style={{
                    background: 'var(--blue-bg)', border: '1px solid rgba(59,130,246,.25)',
                    borderRadius: 'var(--r)', padding: '8px 12px', marginBottom: 12,
                    fontSize: '.82rem', color: 'var(--blue)'
                  }}>
                    💬 <strong>Team message:</strong> {r.responseNote}
                  </div>
                )}

                {/* Linked help request */}
                {r.linkedRequest && (
                  <div style={{
                    background: 'var(--green-bg)', border: '1px solid rgba(16,185,129,.25)',
                    borderRadius: 'var(--r)', padding: '8px 12px', marginBottom: 12,
                    fontSize: '.82rem', color: 'var(--green)'
                  }}>
                    ✅ A volunteer has been assigned: <strong>{r.linkedRequest.title}</strong>
                  </div>
                )}

                {/* Actions */}
                {['submitted','reviewing'].includes(r.status) && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-danger btn-sm"
                      disabled={cancelling === r._id}
                      onClick={() => cancel(r._id)}
                      style={{ background: 'transparent', color: 'var(--red)', border: '1px solid rgba(244,63,94,.3)' }}>
                      {cancelling === r._id ? 'Cancelling…' : 'Cancel Request'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
