import { useState, useEffect, useRef } from 'react';
import { dashboardAPI, volunteersAPI, usersAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/layout/PageHeader';
import Badge, { PriorityDot } from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const TYPE_COLORS = {
  rescue: '#dc2626', medical: '#2563eb', food: '#16a34a',
  shelter: '#d97706', water: '#0891b2', clothing: '#7c3aed', other: '#6b7280'
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e3e8ef',
      borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      padding: '8px 12px', fontSize: '12px'
    }}>
      <span style={{ color: 'var(--t3)' }}>{payload[0].name}: </span>
      <span style={{ color: 'var(--t1)', fontWeight: 600 }}>{payload[0].value}</span>
    </div>
  );
};

const PRIORITY_COLORS = {
  critical: '#dc2626',
  high: '#f97316',
  medium: '#d97706',
  low: '#16a34a',
};

/* ── Map Markers Component ─────────────────────────── */
function LocationMarkers({ points }) {
  if (!points || points.length === 0) return null;

  return points.map((p, i) => (
    <CircleMarker
      key={i}
      center={[p.lat, p.lng]}
      radius={p.priority === 'critical' ? 12 : p.priority === 'high' ? 10 : 8}
      pathOptions={{
        fillColor: PRIORITY_COLORS[p.priority] || '#3b82f6',
        color: '#ffffff',
        weight: 1.5,
        fillOpacity: 0.8
      }}
    >
      <Popup>
        <div style={{ padding: '2px', minWidth: '140px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px', textTransform: 'capitalize', color: 'var(--t1)' }}>
            {p.type} Request
          </div>
          <div style={{ fontSize: '12px', color: 'var(--t3)', marginBottom: '8px' }}>
            {p.area}
          </div>
          <div style={{ display: 'flex', gap: '6px', fontSize: '11px' }}>
            <span style={{ 
              background: (PRIORITY_COLORS[p.priority] || '#3b82f6') + '20', 
              color: PRIORITY_COLORS[p.priority] || '#3b82f6',
              padding: '2px 6px', 
              borderRadius: '4px',
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              {p.priority}
            </span>
            <span style={{ 
              background: 'var(--neutral-bg)', 
              color: 'var(--t2)',
              border: '1px solid var(--border)',
              padding: '2px 6px', 
              borderRadius: '4px',
              fontWeight: 600,
              textTransform: 'capitalize'
            }}>
              {p.status}
            </span>
          </div>
        </div>
      </Popup>
    </CircleMarker>
  ));
}

/* ── Dashboard Components ────────────────────────────── */
export default function DashboardPage() {
  const { user, isVolunteer, refreshUser, logout } = useAuth();
  const [stats, setStats]       = useState(null);
  const [activity, setActivity] = useState([]);
  const [heatData, setHeatData] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [toggling, setToggling] = useState(false);

  const loadData = () => {
    if (isVolunteer) return;
    Promise.all([dashboardAPI.getStats(), dashboardAPI.getActivity(), dashboardAPI.getHeatmap()])
      .then(([s, a, h]) => {
        setStats(s.data.data);
        setActivity(a.data.data);
        setHeatData(h.data.data || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isVolunteer) { setLoading(false); return; }
    loadData();
    const interval = setInterval(loadData, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, [isVolunteer]);

  if (loading) return <><PageHeader title="Dashboard" /><Loader /></>;

  if (isVolunteer) {
    // Volunteer view (Simplified for now as requested, just keeping basic functionality)
    return (
      <>
        <PageHeader title="Dashboard" subtitle={`Welcome back, ${user?.name}`} />
        <div className="page-body page-enter">
          <div className="card" style={{ maxWidth: 500 }}>
            <div style={{ textAlign: 'center', padding: '32px 20px' }}>
              <div className="material-symbols-outlined" style={{ fontSize: '3.5rem', marginBottom: 12, color: 'var(--danger)' }}>emergency</div>
              <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: 8, color: 'var(--t1)' }}>
                Relief Operations Portal
              </div>
              <p style={{ color: 'var(--t3)', fontSize: '13px', marginBottom: 20 }}>
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

  const { requests, volunteers, requestsByType, requestsByPriority, urgentRequests } = stats || {};

  const typeData = (requestsByType || []).map(r => ({ name: r._id, value: r.count }));
  
  // Custom stacked bar logic for priorities
  const pData = (requestsByPriority || []).reduce((acc, r) => { acc[r._id] = r.count; return acc; }, {});
  const totalP = Object.values(pData).reduce((a, b) => a + b, 0) || 1;
  const pPerc = (key) => ((pData[key] || 0) / totalP) * 100;

  const totalPoints   = heatData.length;
  const criticalCount = heatData.filter(p => p.priority === 'critical').length;
  const highCount     = heatData.filter(p => p.priority === 'high').length;

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>Command Dashboard</h1>
          <p>Live overview of all relief operations</p>
        </div>
        <div className="topbar-right">
          <div className="live-indicator">
            <div className="live-dot" />
            <span className="live-text">Live</span>
          </div>
          <button className="btn-primary" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
            Download Report
          </button>
        </div>
      </div>
      
      <div className="page-body page-enter">
        {/* ROW 1: 6 KPI CARDS */}
        <div className="stat-grid">
          <div className="stat-card brand">
            <div className="stat-label">Total Requests</div>
            <div className="stat-value">{requests?.total ?? 0}</div>
            <div className="stat-sublabel">All time</div>
            <div className="stat-icon material-symbols-outlined">assignment</div>
          </div>
          <div className="stat-card warning">
            <div className="stat-label">Pending</div>
            <div className="stat-value">{requests?.pending ?? 0}</div>
            <div className="stat-sublabel">Needs attention</div>
            <div className="stat-icon material-symbols-outlined">hourglass_empty</div>
          </div>
          <div className="stat-card danger">
            <div className="stat-label">Critical</div>
            <div className="stat-value">{requests?.critical ?? 0}</div>
            <div className="stat-sublabel">Unresolved SOS</div>
            <div className="stat-icon material-symbols-outlined">warning</div>
          </div>
          <div className="stat-card info">
            <div className="stat-label">In Progress</div>
            <div className="stat-value">{requests?.inProgress ?? 0}</div>
            <div className="stat-sublabel">Active operations</div>
            <div className="stat-icon material-symbols-outlined">bolt</div>
          </div>
          <div className="stat-card success">
            <div className="stat-label">Resolved</div>
            <div className="stat-value">{requests?.resolved ?? 0}</div>
            <div className="stat-sublabel">Successfully closed</div>
            <div className="stat-icon material-symbols-outlined">check_circle</div>
          </div>
          <div className="stat-card neutral">
            <div className="stat-label">Available Vols.</div>
            <div className="stat-value">{volunteers?.available ?? 0}</div>
            <div className="stat-sublabel">of {volunteers?.total ?? 0} total</div>
            <div className="stat-icon material-symbols-outlined">groups</div>
          </div>
        </div>

        {/* ROW 2: SPLIT LAYOUT */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '20px' }}>
          
          {/* LEFT: Heatmap & Charts */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Disaster Heatmap</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ background: 'var(--neutral-bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '3px 10px', fontSize: '11px', fontWeight: 600, color: 'var(--t3)', display: 'flex', gap: '4px' }}>
                  Locations <span style={{color: 'var(--t1)'}}>{totalPoints}</span>
                </div>
                <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-br)', borderRadius: 'var(--r-sm)', padding: '3px 10px', fontSize: '11px', fontWeight: 600, color: 'var(--danger)', display: 'flex', gap: '4px' }}>
                  Critical <span style={{color: 'var(--danger)'}}>{criticalCount}</span>
                </div>
                <div style={{ background: 'var(--neutral-bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '3px 10px', fontSize: '11px', fontWeight: 600, color: 'var(--t3)', display: 'flex', gap: '4px' }}>
                  High <span style={{color: 'var(--t1)'}}>{highCount}</span>
                </div>
              </div>
            </div>
            
            <div style={{ minHeight: '300px', borderBottom: '1px solid var(--border)' }}>
              {heatData.length === 0 ? (
                <div className="empty-state">
                  <div className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--t4)' }}>map</div>
                  <h3 style={{ fontSize: '15px', color: 'var(--t1)', marginTop: '16px' }}>No location data</h3>
                  <p style={{ fontSize: '13px', color: 'var(--t3)' }}>Heatmap will appear when coordinates are logged.</p>
                </div>
              ) : (
                <MapContainer
                  center={[22.5, 82.0]} zoom={5} minZoom={4} scrollWheelZoom={true}
                  style={{ height: '300px', width: '100%', borderRadius: 0, zIndex: 0 }}
                >
                  <TileLayer url="https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png" />
                  <LocationMarkers points={heatData} />
                </MapContainer>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px' }}>Requests by Type</div>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={typeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#f0f2f5" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--hover)' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={28}>
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={TYPE_COLORS[entry.name] || '#6b7280'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px' }}>Priority Split</div>
                
                <div style={{ display: 'flex', width: '100%', height: '10px', borderRadius: '999px', overflow: 'hidden', marginBottom: '16px' }}>
                  <div style={{ width: `${pPerc('critical')}%`, background: 'var(--danger)' }} />
                  <div style={{ width: `${pPerc('high')}%`, background: '#f97316' }} />
                  <div style={{ width: `${pPerc('medium')}%`, background: 'var(--warning)' }} />
                  <div style={{ width: `${pPerc('low')}%`, background: 'var(--success)' }} />
                </div>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  {['critical', 'high', 'medium', 'low'].map(p => (
                    <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: p === 'critical' ? 'var(--danger)' : p === 'high' ? '#f97316' : p === 'medium' ? 'var(--warning)' : 'var(--success)' }} />
                      <span style={{ fontSize: '11px', color: 'var(--t3)', textTransform: 'capitalize' }}>{p}</span>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--t1)' }}>{Math.round(pPerc(p))}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Stacked Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div className="card">
              <div className="card-header">
                <div className="card-title">Urgent Requests</div>
              </div>
              <div className="card-body" style={{ padding: '0' }}>
                {(!urgentRequests || urgentRequests.length === 0) ? (
                  <div style={{ padding: '20px', fontSize: '13px', color: 'var(--t4)', textAlign: 'center' }}>No urgent requests</div>
                ) : (
                  urgentRequests.map(r => (
                    <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                      <div className={`priority-dot ${r.priority}`} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--t1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--t4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.location?.area || 'Unknown'}</div>
                      </div>
                      <Badge value={r.status} />
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Recent Activity</div>
              </div>
              <div className="card-body" style={{ padding: '0' }}>
                {activity.length === 0 ? (
                  <div style={{ padding: '20px', fontSize: '13px', color: 'var(--t4)', textAlign: 'center' }}>No recent activity</div>
                ) : (
                  activity.slice(0, 5).map(r => (
                    <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--t1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--t4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.raisedBy?.name}</div>
                      </div>
                      <Badge value={r.status} />
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card" style={{ background: 'var(--success-bg)', borderColor: 'var(--success-br)' }}>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>Volunteers Available</div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--success)', letterSpacing: '-0.04em', lineHeight: 1 }}>{volunteers?.available ?? 0}</div>
                <div style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '8px' }}>Out of {volunteers?.total ?? 0} total volunteers</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
