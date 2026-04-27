import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { victimAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/common/Loader';

export default function VictimDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    victimAPI.getMyRequests()
      .then(({ data }) => setRequests(data.data.docs))
      .finally(() => setLoading(false));
  }, []);

  const active   = requests.filter(r => !['resolved','closed'].includes(r.status));
  const resolved = requests.filter(r => r.status === 'resolved');
  const latest   = requests[0];

  const steps = [
    { id: 'submitted', label: 'Submitted' },
    { id: 'reviewing', label: 'Reviewing' },
    { id: 'linked',    label: 'Assigned' },
    { id: 'resolved',  label: 'Resolved' }
  ];
  
  const currentStepIndex = latest ? steps.findIndex(s => s.id === latest.status) : -1;
  // Fallback for "assigned" mapping vs "linked"
  const actualIndex = latest?.status === 'assigned' ? 2 : currentStepIndex;
  
  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>My Dashboard</h1>
          <p>Welcome, {user?.name}. Stay safe.</p>
        </div>
      </div>
      
      <div className="page-body page-enter">
        <div style={{ display: 'grid', gridTemplateColumns: '60% 1fr', gap: '20px' }}>
          
          {/* LEFT COLUMN */}
          <div>
            {/* Emergency Banner */}
            <div className="alert-banner">
              <span className="material-symbols-outlined">warning</span>
              <p><strong>Emergency:</strong> If this is a life-threatening situation, please call 112 immediately. CrisisConnect coordinates relief, but emergency services are faster.</p>
            </div>

            {/* KPI Cards */}
            <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '20px' }}>
              <div className="stat-card brand" style={{ padding: '12px 16px' }}>
                <div className="stat-label">Total Requests</div>
                <div className="stat-value" style={{ fontSize: '22px' }}>{requests.length}</div>
              </div>
              <div className="stat-card warning" style={{ padding: '12px 16px' }}>
                <div className="stat-label">Active</div>
                <div className="stat-value" style={{ fontSize: '22px' }}>{active.length}</div>
              </div>
              <div className="stat-card success" style={{ padding: '12px 16px' }}>
                <div className="stat-label">Resolved</div>
                <div className="stat-value" style={{ fontSize: '22px' }}>{resolved.length}</div>
              </div>
            </div>

            {/* Latest Request Card */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Latest Request Status</div>
                <Link to="/app/victim-requests" className="btn-ghost" style={{ padding: '4px 10px', fontSize: '12px' }}>View all</Link>
              </div>
              <div className="card-body">
                {loading ? <div style={{ padding: '40px 0' }}><Loader /></div> : !latest ? (
                  <div className="empty-state" style={{ padding: '40px 0' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--t4)', marginBottom: '16px' }}>inbox</span>
                    <h3 style={{ fontSize: '15px', color: 'var(--t1)', marginBottom: '6px' }}>No requests yet</h3>
                    <p style={{ fontSize: '13px', color: 'var(--t3)' }}>Submit a new SOS request if you need help.</p>
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--t1)', textTransform: 'capitalize', marginBottom: '4px' }}>
                        {latest.requestType || 'Help Request'}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--t3)', marginBottom: '8px' }}>
                        {latest.title || latest.description?.slice(0, 80) + '...'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--t4)' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>pin_drop</span>
                        {latest.location?.area || latest.location?.address}
                      </div>
                    </div>

                    {/* Progress Stepper */}
                    <div className="tracker-stepper">
                      <div className="tracker-line" />
                      <div className="tracker-line tracker-line-fill" style={{ width: `${(Math.max(actualIndex, 0) / (steps.length - 1)) * 100}%` }} />
                      
                      {steps.map((step, i) => {
                        const isDone = i < actualIndex;
                        const isCurrent = i === actualIndex || (actualIndex === -1 && i === 0);
                        
                        return (
                          <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                            <div className={`tracker-node ${isDone ? 'done' : isCurrent ? 'current' : 'future'}`}>
                              {isDone ? <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check</span> : (i + 1)}
                            </div>
                            <div className={`tracker-label ${isCurrent ? 'active' : ''}`}>
                              {step.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {latest.responseNote && (
                      <div style={{ background: 'var(--info-bg)', border: '1px solid var(--info-br)', borderRadius: 'var(--r-md)', padding: '10px 14px', marginTop: '40px', fontSize: '12px', color: 'var(--t2)', fontStyle: 'italic' }}>
                        <strong style={{ fontStyle: 'normal', display: 'block', color: 'var(--info)', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Message from team:</strong>
                        "{latest.responseNote}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div>
            <div className="card" style={{ marginBottom: '20px' }}>
              <div className="card-header">
                <div className="card-title">How to get help</div>
              </div>
              <div className="card-body">
                <div style={{ position: 'relative', paddingLeft: '16px' }}>
                  <div style={{ position: 'absolute', left: 0, top: '10px', bottom: '10px', width: '1px', background: 'var(--border)' }} />
                  
                  {[
                    { title: 'Submit an SOS Request', desc: 'Click "New SOS Request" below and describe what you need.' },
                    { title: 'Team Reviews It', desc: 'Our coordinators review your request and assign it to an available volunteer near you.' },
                    { title: 'Volunteer is Assigned', desc: 'A trained volunteer will be dispatched to help you. Track status here in real time.' },
                    { title: 'Help Arrives', desc: 'Once resolved, your request will be marked complete. You can submit new requests anytime.' },
                  ].map((s, i) => (
                    <div key={i} style={{ position: 'relative', marginBottom: i === 3 ? 0 : '20px' }}>
                      <div style={{ position: 'absolute', left: '-25px', top: '2px', width: '18px', height: '18px', borderRadius: '50%', background: 'var(--brand)', color: '#fff', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {i + 1}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t1)', marginBottom: '4px' }}>{s.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--t4)', lineHeight: 1.5 }}>{s.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Link to="/victim/submit" className="btn-primary" style={{ display: 'flex', width: '100%', height: '44px', fontSize: '13px', fontWeight: 600, justifyContent: 'center' }}>
              New SOS Request
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
