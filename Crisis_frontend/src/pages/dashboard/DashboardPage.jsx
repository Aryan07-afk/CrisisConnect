import { useState, useEffect, useRef } from 'react';
import { dashboardAPI, volunteersAPI, usersAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/layout/PageHeader';
import Badge, { PriorityDot } from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

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

/* ── Heatmap Layer Component ─────────────────────────── */
function HeatmapLayer({ points }) {
  const map = useMap();
  const heatLayerRef = useRef(null);

  useEffect(() => {
    if (!points || points.length === 0) return;

    import('leaflet').then((LModule) => {
      window.L = LModule.default || LModule;
      import('leaflet.heat').then(() => {
        // Remove previous layer if exists
        if (heatLayerRef.current) {
          map.removeLayer(heatLayerRef.current);
        }

        const heatData = points.map(p => [p.lat, p.lng, p.intensity]);

        // Calculate max value dynamically based on density
        // A single critical point is 1.0. To see red, we need a density of ~3.0.
        // We'll set max to 3.0 so a single point looks blue/green, and clusters look red.
        const dynamicMax = Math.max(1.0, points.length * 0.15);

        heatLayerRef.current = window.L.heatLayer(heatData, {
          radius: 30,
          blur: 20,
          maxZoom: 12,
          max: dynamicMax > 5.0 ? 5.0 : 3.0, // cap max to show relative hot spots
          gradient: {
            0.0: '#080c12',
            0.2: '#3b82f6',
            0.4: '#10b981',
            0.6: '#f59e0b',
            0.8: '#f97316',
            1.0: '#f43f5e',
          },
        }).addTo(map);
      });
    });

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [points, map]);

  return null;
}

/* ── Heatmap Card Component ──────────────────────────── */
function DisasterHeatmap() {
  const [heatData, setHeatData] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const loadHeatmap = () => {
    dashboardAPI.getHeatmap()
      .then(res => setHeatData(res.data.data || []))
      .catch(() => setError('Failed to load heatmap data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadHeatmap();
    // Poll every 15 seconds
    const interval = setInterval(loadHeatmap, 15000);
    return () => clearInterval(interval);
  }, []);

  // Summary stats from heatmap data
  const totalPoints   = heatData.length;
  const criticalCount = heatData.filter(p => p.priority === 'critical').length;
  const highCount     = heatData.filter(p => p.priority === 'high').length;
  const totalAffected = heatData.reduce((sum, p) => sum + (p.affected || 0), 0);

  return (
    <div className="card heatmap-card" style={{ marginBottom: 20 }}>
      <div className="card-header">
        <div>
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.1rem' }}>🗺️</span>
            Disaster Heatmap
          </div>
          <div className="card-subtitle">
            Real-time visualization of disaster locations and intensity
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {totalPoints > 0 && (
            <>
              <div className="heatmap-stat">
                <span className="heatmap-stat-value">{totalPoints}</span>
                <span className="heatmap-stat-label">Locations</span>
              </div>
              <div className="heatmap-stat">
                <span className="heatmap-stat-value" style={{ color: 'var(--red)' }}>{criticalCount}</span>
                <span className="heatmap-stat-label">Critical</span>
              </div>
              <div className="heatmap-stat">
                <span className="heatmap-stat-value" style={{ color: 'var(--yellow)' }}>{highCount}</span>
                <span className="heatmap-stat-label">High</span>
              </div>
              <div className="heatmap-stat">
                <span className="heatmap-stat-value" style={{ color: 'var(--accent)' }}>{totalAffected}</span>
                <span className="heatmap-stat-label">Affected</span>
              </div>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader />
        </div>
      ) : error ? (
        <div className="empty-state" style={{ padding: '40px 0' }}>
          <p style={{ color: 'var(--red)' }}>{error}</p>
        </div>
      ) : (
        <div className="heatmap-container">
          <MapContainer
            center={[22.5, 82.0]}
            zoom={5}
            minZoom={4}
            maxBounds={[
              [6.5, 68.0],
              [37.5, 97.5]
            ]}
            maxBoundsViscosity={1.0}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', borderRadius: '0 0 8px 8px' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <HeatmapLayer points={heatData} />
          </MapContainer>

          {/* Legend */}
          <div className="heatmap-legend">
            <span className="heatmap-legend-title">Intensity</span>
            <div className="heatmap-legend-bar" />
            <div className="heatmap-legend-labels">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
              <span>Critical</span>
            </div>
          </div>

          {totalPoints === 0 && (
            <div className="heatmap-empty-overlay">
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>📍</div>
              <p>No disaster locations with coordinates yet</p>
              <p style={{ fontSize: '.75rem', color: 'var(--text3)' }}>
                Help requests with lat/lng coordinates will appear here
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user, canManage, isVolunteer, refreshUser, logout } = useAuth();
  const [stats, setStats]       = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [toggling, setToggling] = useState(false);

  const loadData = () => {
    if (isVolunteer) return;
    Promise.all([dashboardAPI.getStats(), dashboardAPI.getActivity()])
      .then(([s, a]) => {
        setStats(s.data.data);
        setActivity(a.data.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isVolunteer) { setLoading(false); return; }
    loadData();
    // Poll every 15 seconds for updates (including escalated requests)
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
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

              <div style={{ marginBottom: 24, padding: '16px', background: 'var(--bg3)', borderRadius: 'var(--r)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '.85rem', marginBottom: 8, color: 'var(--text2)' }}>Current Status</div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: user?.isAvailable ? 'var(--green)' : 'var(--text3)', marginBottom: 12 }}>
                  {user?.isAvailable ? '● Available for Assignments' : '● Currently Busy'}
                </div>
                <button 
                  className={`btn ${user?.isAvailable ? 'btn-ghost' : 'btn-success'}`}
                  onClick={async () => {
                    setToggling(true);
                    try {
                      await volunteersAPI.toggleAvailability(user._id);
                      if (refreshUser) await refreshUser();
                    } catch (e) { alert(e.response?.data?.message || 'Failed to toggle API'); }
                    setToggling(false);
                  }}
                  disabled={toggling}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {toggling ? 'Updating…' : (user?.isAvailable ? 'Mark as Busy' : 'Mark as Available')}
                </button>
                <button 
                  className="btn btn-ghost mt-2"
                  style={{ width: '100%', justifyContent: 'center', color: 'var(--red)', border: '1px solid rgba(244,63,94,.2)' }}
                  onClick={async () => {
                    if (!window.confirm("Are you sure you want to go deeply Inactive? You will be logged out immediately, and an Admin will need to reactivate your account before you can log in again.")) return;
                    try {
                      await usersAPI.update(user._id, { isActive: false });
                      logout();
                    } catch (e) { alert(e.response?.data?.message || 'Failed to deactivate account'); }
                  }}
                >
                  Deactivate Account (Long-term Inactive)
                </button>
              </div>

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

        {/* Disaster Heatmap */}
        <DisasterHeatmap />

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
                    background: r.escalated ? 'rgba(244, 63, 94, 0.1)' : 'var(--bg3)', 
                    border: `1px solid ${r.escalated ? 'var(--red)' : 'var(--border)'}`,
                    borderRadius: 'var(--r)', padding: '10px 14px'
                  }}>
                    <div className="flex-between mb-1" style={{ marginBottom: 4 }}>
                      <strong style={{ fontSize: '.88rem', color: r.escalated ? 'var(--red)' : 'inherit' }}>
                        <PriorityDot priority={r.priority} />{r.title}
                      </strong>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {r.escalated && <span style={{ fontSize: '.7rem', color: '#fff', background: 'var(--red)', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>ESCALATED</span>}
                        <Badge value={r.priority} />
                      </div>
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
