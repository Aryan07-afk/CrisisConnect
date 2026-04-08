import { useState, useEffect } from 'react';
import { dashboardAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/layout/PageHeader';
import Badge, { PriorityDot } from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const PIE_COLORS = ['#f97316','#f43f5e','#3b82f6','#10b981','#8b5cf6','#f59e0b'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:'var(--bg3)', border:'1px solid var(--border2)',
      borderRadius:'var(--r)', padding:'8px 12px', fontSize:'.8rem'
    }}>
      <span style={{color:'var(--text)'}}>{payload[0].name}: </span>
      <span style={{color:'var(--accent)', fontWeight:700}}>{payload[0].value}</span>
    </div>
  );
};

export default function DashboardPage() {
  const { user, canManage, isVolunteer } = useAuth();
  const [stats, setStats]       = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (isVolunteer) { setLoading(false); return; }
    Promise.all([dashboardAPI.getStats(), dashboardAPI.getActivity()])
      .then(([s, a]) => {
        setStats(s.data.data);
        setActivity(a.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <><PageHeader title="Dashboard" /><Loader /></>;

  if (isVolunteer) {
    return (
      <>
        <PageHeader title="Dashboard" subtitle={`Welcome back, ${user?.name}`} />
        <div className="page-body page-enter">
          <div className="card" style={{ maxWidth: 500 }}>
            <div style={{ textAlign: 'center', padding: '32px 20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🚨</div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>
                Relief Operations Portal
              </div>
              <p style={{ color: 'var(--text2)', fontSize: '.9rem', marginBottom: 20 }}>
                Use the sidebar to manage help requests and your assignments.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <a href="/app/requests" className="btn btn-primary">View Requests</a>
                <a href="/app/assignments" className="btn btn-ghost">My Assignments</a>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const { requests, volunteers, assignments, requestsByType, requestsByPriority, urgentRequests } = stats || {};

  const typeData = (requestsByType || []).map(r => ({ name: r._id, value: r.count }));
  const priorityData = (requestsByPriority || []).map(r => ({ name: r._id, value: r.count }));

  return (
    <>
      <PageHeader
        title="Command Dashboard"
        subtitle="Live overview of all relief operations"
        actions={
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.72rem', color: 'var(--text3)' }}>
            {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
        }
      />
      <div className="page-body page-enter">

        {/* Stat Cards */}
        <div className="stat-grid">
          <div className="stat-card orange">
            <div className="stat-label">Total Requests</div>
            <div className="stat-value">{requests?.total ?? 0}</div>
            <div className="stat-icon">📋</div>
            <div className="stat-sub">All time</div>
          </div>
          <div className="stat-card red">
            <div className="stat-label">Pending</div>
            <div className="stat-value">{requests?.pending ?? 0}</div>
            <div className="stat-icon">⏳</div>
            <div className="stat-sub">Needs attention</div>
          </div>
          <div className="stat-card yellow">
            <div className="stat-label">Critical</div>
            <div className="stat-value">{requests?.critical ?? 0}</div>
            <div className="stat-icon">🔴</div>
            <div className="stat-sub">Unresolved</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-label">In Progress</div>
            <div className="stat-value">{requests?.inProgress ?? 0}</div>
            <div className="stat-icon">⚡</div>
            <div className="stat-sub">Active now</div>
          </div>
          <div className="stat-card green">
            <div className="stat-label">Resolved</div>
            <div className="stat-value">{requests?.resolved ?? 0}</div>
            <div className="stat-icon">✅</div>
            <div className="stat-sub">Completed</div>
          </div>
          <div className="stat-card green">
            <div className="stat-label">Available Vols.</div>
            <div className="stat-value">{volunteers?.available ?? 0}</div>
            <div className="stat-icon">👥</div>
            <div className="stat-sub">of {volunteers?.total ?? 0} total</div>
          </div>
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Requests by Type</div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={typeData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,.04)' }} />
                <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Priority Distribution</div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={priorityData} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                  paddingAngle={3}>
                  {priorityData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle" iconSize={8}
                  formatter={(v) => <span style={{ color: 'var(--text2)', fontSize: '.78rem' }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Two-column bottom */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Urgent Requests */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Urgent Requests</div>
              <a href="/app/requests" className="btn btn-ghost btn-sm">View all</a>
            </div>
            {(!urgentRequests || urgentRequests.length === 0) ? (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <p>No urgent pending requests 🎉</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {urgentRequests.map(r => (
                  <div key={r._id} style={{
                    background: 'var(--bg3)', border: '1px solid var(--border)',
                    borderRadius: 'var(--r)', padding: '10px 14px'
                  }}>
                    <div className="flex-between mb-1" style={{ marginBottom: 4 }}>
                      <strong style={{ fontSize: '.88rem' }}>
                        <PriorityDot priority={r.priority} />{r.title}
                      </strong>
                      <Badge value={r.priority} />
                    </div>
                    <div style={{ fontSize: '.75rem', color: 'var(--text3)' }}>
                      📍 {r.location?.area || r.location?.address} &nbsp;·&nbsp;
                      By {r.raisedBy?.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Recent Activity</div>
            </div>
            {activity.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 0' }}><p>No activity yet</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activity.slice(0, 6).map(r => (
                  <div key={r._id} className="flex-between" style={{
                    padding: '8px 0', borderBottom: '1px solid var(--border)',
                  }}>
                    <div>
                      <div style={{ fontSize: '.85rem', fontWeight: 600 }}>{r.title}</div>
                      <div style={{ fontSize: '.73rem', color: 'var(--text3)' }}>
                        {r.requestType} · {r.raisedBy?.name}
                      </div>
                    </div>
                    <Badge value={r.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
