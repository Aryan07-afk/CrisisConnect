import { useState, useEffect, useCallback } from 'react';
import { auditAPI } from '../../api';
import Loader from '../../components/common/Loader';

const ACTION_META = {
  user_role_changed:       { label: 'Role Changed',        icon: 'swap_horiz',       color: 'var(--info)',    bg: 'var(--info-bg)',    br: 'var(--info-br)' },
  user_deactivated:        { label: 'User Deactivated',    icon: 'person_off',       color: 'var(--danger)',  bg: 'var(--danger-bg)',  br: 'var(--danger-br)' },
  user_activated:          { label: 'User Activated',      icon: 'person_check',     color: 'var(--success)', bg: 'var(--success-bg)', br: 'var(--success-br)' },
  user_deleted:            { label: 'User Deleted',        icon: 'person_remove',    color: 'var(--danger)',  bg: 'var(--danger-bg)',  br: 'var(--danger-br)' },
  coordinator_approved:    { label: 'Coordinator Approved',icon: 'verified',         color: 'var(--success)', bg: 'var(--success-bg)', br: 'var(--success-br)' },
  coordinator_rejected:    { label: 'Coordinator Rejected',icon: 'block',            color: 'var(--warning)', bg: 'var(--warning-bg)', br: 'var(--warning-br)' },
  assignment_created:      { label: 'Assignment Created',  icon: 'assignment_turned_in', color: 'var(--info)',   bg: 'var(--info-bg)',   br: 'var(--info-br)' },
  assignment_cancelled:    { label: 'Assignment Cancelled',icon: 'assignment_return',color: 'var(--warning)', bg: 'var(--warning-bg)', br: 'var(--warning-br)' },
};

const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (actionFilter) params.action = actionFilter;
      const { data } = await auditAPI.getAll(params);
      setLogs(Array.isArray(data.data) ? data.data : data.data.docs || []);
      setError('');
    } catch {
      setError('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [actionFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>Audit Log</h1>
          <p>Immutable trail of administrative actions</p>
        </div>
      </div>

      <div className="page-body page-enter">
        {error && (
          <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-br)', padding: '12px 16px', borderRadius: 'var(--r-md)', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <button
            className={`btn-ghost${actionFilter === '' ? ' active-filter' : ''}`}
            onClick={() => setActionFilter('')}
          >
            All
          </button>
          {Object.entries(ACTION_META).map(([key, meta]) => (
            <button
              key={key}
              className={`btn-ghost${actionFilter === key ? ' active-filter' : ''}`}
              onClick={() => setActionFilter(key)}
            >
              {meta.label}
            </button>
          ))}
        </div>

        {loading ? (
          <Loader />
        ) : logs.length === 0 ? (
          <div className="card">
            <div className="empty-state" style={{ padding: '48px 24px', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--t4)', marginBottom: '16px' }}>history</span>
              <p style={{ color: 'var(--t3)' }}>No audit entries yet. Admin actions will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="audit-list">
            {logs.map((log, i) => {
              const meta = ACTION_META[log.action] || { label: log.action, icon: 'circle', color: 'var(--t3)', bg: 'var(--neutral-bg)', br: 'var(--neutral-br)' };
              return (
                <div className="audit-row" key={log._id} style={{ '--i': i }}>
                  <div className="audit-icon" style={{ background: meta.bg, color: meta.color, borderColor: meta.br }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{meta.icon}</span>
                  </div>
                  <div className="audit-content">
                    <div className="audit-title">
                      <strong>{log.actorName || 'Unknown'}</strong>
                      <span className="audit-role">{log.actorRole}</span>
                      <span>{meta.label.toLowerCase()}</span>
                      {log.targetLabel && <span className="audit-target">— {log.targetLabel}</span>}
                    </div>
                    {log.meta && Object.keys(log.meta).length > 0 && (
                      <div className="audit-meta">
                        {Object.entries(log.meta).map(([k, v]) => (
                          <span key={k} className="audit-meta-chip">{k}: {String(v)}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="audit-time" title={new Date(log.createdAt).toLocaleString()}>
                    {timeAgo(log.createdAt)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
