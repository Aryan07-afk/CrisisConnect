import { useState, useEffect, useRef } from 'react';
import { dashboardAPI, volunteersAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { jsPDF } from 'jspdf';

const TYPE_COLORS = {
  rescue: '#dc2626', medical: '#2563eb', food: '#16a34a',
  shelter: '#d97706', water: '#0891b2', clothing: '#7c3aed', other: '#6b7280'
};

const PRIORITY_COLORS = {
  critical: '#dc2626', high: '#f97316', medium: '#d97706', low: '#16a34a',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      padding: '8px 12px', fontSize: '12px'
    }}>
      <span style={{ color: 'var(--t3)' }}>{payload[0].name}: </span>
      <span style={{ color: 'var(--t1)', fontWeight: 600 }}>{payload[0].value}</span>
    </div>
  );
};

/* ── Map Search & Fly ─────────────────────────── */
function MapSearchControl() {
  const map = useMap();
  const [query, setQuery] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=1`);
      const data = await res.json();
      if (data.length > 0) {
        map.flyTo([parseFloat(data[0].lat), parseFloat(data[0].lon)], 10, { duration: 1.5 });
      }
    } catch {}
  };

  return (
    <div className="map-search-container">
      <form onSubmit={handleSearch} style={{ position: 'relative' }}>
        <span className="material-symbols-outlined map-search-icon">search</span>
        <input
          className="map-search-input"
          placeholder="Search city or district…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>
    </div>
  );
}

/* ── Map Markers ─────────────────────────── */
function LocationMarkers({ points }) {
  if (!points || points.length === 0) return null;
  return points.map((p, i) => (
    <CircleMarker key={`req-${i}`} center={[p.lat, p.lng]}
      radius={p.priority === 'critical' ? 12 : p.priority === 'high' ? 10 : 8}
      pathOptions={{ fillColor: PRIORITY_COLORS[p.priority] || '#3b82f6', color: '#ffffff', weight: 1.5, fillOpacity: 0.8 }}>
      <Popup>
        <div style={{ padding: '2px', minWidth: '140px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px', textTransform: 'capitalize' }}>{p.type} Request</div>
          <div style={{ fontSize: '12px', color: 'var(--t3)', marginBottom: '8px' }}>{p.area}</div>
          <div style={{ display: 'flex', gap: '6px', fontSize: '11px' }}>
            <span style={{ background: (PRIORITY_COLORS[p.priority] || '#3b82f6') + '20', color: PRIORITY_COLORS[p.priority], padding: '2px 6px', borderRadius: '4px', fontWeight: 600, textTransform: 'uppercase' }}>{p.priority}</span>
            <span style={{ background: 'var(--neutral-bg)', color: 'var(--t2)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, textTransform: 'capitalize' }}>{p.status}</span>
          </div>
        </div>
      </Popup>
    </CircleMarker>
  ));
}

function VolunteerMarkers({ volunteers }) {
  if (!volunteers || volunteers.length === 0) return null;
  return volunteers.map((v) => (
    <CircleMarker key={`vol-${v._id}`} center={[v.lat, v.lng]} radius={6}
      pathOptions={{ fillColor: '#16a34a', color: '#ffffff', weight: 2, fillOpacity: 0.9 }}>
      <Popup>
        <div style={{ minWidth: '120px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>{v.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--t3)' }}>{v.skills?.join(', ') || 'General'}</div>
          <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: 600, marginTop: '4px' }}>● Available</div>
        </div>
      </Popup>
    </CircleMarker>
  ));
}

/* ── PDF Report Generator ─────────────────────── */
function generatePDF(stats, typeData) {
  const doc = new jsPDF();
  const now = new Date().toLocaleString('en-IN');

  // Header
  doc.setFillColor(232, 98, 42);
  doc.rect(0, 0, 210, 32, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('CrisisConnect', 14, 16);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Dashboard Report · ${now}`, 14, 24);

  // KPIs
  doc.setTextColor(10, 15, 30);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary Statistics', 14, 44);

  const kpis = [
    ['Total Requests', stats.requests?.total ?? 0],
    ['Pending', stats.requests?.pending ?? 0],
    ['Critical (Unresolved)', stats.requests?.critical ?? 0],
    ['In Progress', stats.requests?.inProgress ?? 0],
    ['Resolved', stats.requests?.resolved ?? 0],
    ['Available Volunteers', `${stats.volunteers?.available ?? 0} / ${stats.volunteers?.total ?? 0}`],
  ];

  let y = 52;
  doc.setFontSize(11);
  kpis.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(label, 14, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 15, 30);
    doc.text(String(value), 100, y);
    y += 8;
  });

  // Requests by Type
  y += 8;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(10, 15, 30);
  doc.text('Requests by Type', 14, y);
  y += 8;
  doc.setFontSize(11);
  typeData.forEach((item) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(item.name, 14, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 15, 30);
    doc.text(String(item.value), 100, y);
    y += 7;
  });

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(156, 163, 175);
  doc.text('Generated by CrisisConnect Platform', 14, 285);
  doc.text(`© ${new Date().getFullYear()} CrisisCoders`, 160, 285);

  doc.save(`CrisisConnect_Report_${new Date().toISOString().slice(0,10)}.pdf`);
}

/* ── Dashboard ────────────────────────────── */
export default function DashboardPage() {
  const { user, isVolunteer } = useAuth();
  const [stats, setStats]       = useState(null);
  const [activity, setActivity] = useState([]);
  const [heatData, setHeatData] = useState([]);
  const [volPositions, setVolPositions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [kpiFilter, setKpiFilter] = useState(null);
  const [chartFilter, setChartFilter] = useState(null);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('cc_dark_mode') === 'true'; } catch { return false; }
  });

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
    localStorage.setItem('cc_dark_mode', String(darkMode));
  }, [darkMode]);

  const loadData = () => {
    if (isVolunteer) return;
    Promise.all([
      dashboardAPI.getStats(), dashboardAPI.getActivity(),
      dashboardAPI.getHeatmap(), dashboardAPI.getVolunteerPositions()
    ]).then(([s, a, h, v]) => {
      setStats(s.data.data);
      setActivity(a.data.data);
      setHeatData(h.data.data || []);
      setVolPositions(v.data.data || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isVolunteer) { setLoading(false); return; }
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [isVolunteer]);

  if (loading) return <><PageHeader title="Dashboard" /><Loader /></>;

  if (isVolunteer) {
    return (
      <>
        <PageHeader title="Dashboard" subtitle={`Welcome back, ${user?.name}`} />
        <div className="page-body page-enter">
          <div className="card" style={{ maxWidth: 500 }}>
            <div style={{ textAlign: 'center', padding: '32px 20px' }}>
              <div className="material-symbols-outlined" style={{ fontSize: '3.5rem', marginBottom: 12, color: 'var(--danger)' }}>emergency</div>
              <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: 8, color: 'var(--t1)' }}>Relief Operations Portal</div>
              <p style={{ color: 'var(--t3)', fontSize: '13px', marginBottom: 20 }}>Use the sidebar to manage help requests and your assignments.</p>
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
  const pData = (requestsByPriority || []).reduce((acc, r) => { acc[r._id] = r.count; return acc; }, {});
  const totalP = Object.values(pData).reduce((a, b) => a + b, 0) || 1;
  const pPerc = (key) => ((pData[key] || 0) / totalP) * 100;

  // Filter urgent requests based on KPI card and chart clicks
  let filteredUrgent = urgentRequests || [];
  if (kpiFilter === 'pending') filteredUrgent = filteredUrgent.filter(r => r.status === 'pending');
  else if (kpiFilter === 'critical') filteredUrgent = filteredUrgent.filter(r => r.priority === 'critical');
  if (chartFilter) filteredUrgent = filteredUrgent.filter(r => r.requestType === chartFilter);

  const totalPoints   = heatData.length;
  const criticalCount = heatData.filter(p => p.priority === 'critical').length;
  const highCount     = heatData.filter(p => p.priority === 'high').length;

  const kpiCards = [
    { key: null, cls: 'brand', label: 'Total Requests', value: requests?.total ?? 0, sub: 'All time', icon: 'assignment' },
    { key: 'pending', cls: 'warning', label: 'Pending', value: requests?.pending ?? 0, sub: 'Needs attention', icon: 'hourglass_empty' },
    { key: 'critical', cls: 'danger', label: 'Critical', value: requests?.critical ?? 0, sub: 'Unresolved SOS', icon: 'warning' },
    { key: 'in_progress', cls: 'info', label: 'In Progress', value: requests?.inProgress ?? 0, sub: 'Active operations', icon: 'bolt' },
    { key: 'resolved', cls: 'success', label: 'Resolved', value: requests?.resolved ?? 0, sub: 'Successfully closed', icon: 'check_circle' },
    { key: null, cls: 'neutral', label: 'Available Vols.', value: volunteers?.available ?? 0, sub: `of ${volunteers?.total ?? 0} total`, icon: 'groups', noFilter: true },
  ];

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>Command Dashboard</h1>
          <p>Live overview of all relief operations</p>
        </div>
        <div className="topbar-right">
          <button className="dark-mode-toggle" onClick={() => setDarkMode(d => !d)} title={darkMode ? 'Light Mode' : 'Dark Mode'}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{darkMode ? 'light_mode' : 'dark_mode'}</span>
            {darkMode ? 'Light' : 'Dark'}
          </button>
          <div className="live-indicator">
            <div className="live-dot" />
            <span className="live-text">Live</span>
          </div>
          <div style={{ position: 'relative' }}>
            <button className="btn-primary btn-report" onClick={() => setShowReportMenu(m => !m)}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
              Download Report
            </button>
            {showReportMenu && (
              <div className="btn-report-menu">
                <button onClick={() => { generatePDF(stats, typeData); setShowReportMenu(false); }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>picture_as_pdf</span>
                  PDF Report
                </button>
                <button onClick={() => { window.print(); setShowReportMenu(false); }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>print</span>
                  Print Page
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="page-body page-enter">
        {/* KPI Cards */}
        <div className="stat-grid">
          {kpiCards.map((card) => (
            <div key={card.label}
              className={`stat-card ${card.cls} clickable ${kpiFilter === card.key && card.key ? 'active-filter' : ''}`}
              onClick={() => {
                if (card.noFilter) return;
                setKpiFilter(prev => prev === card.key ? null : card.key);
              }}
            >
              <div className="stat-label">{card.label}</div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-sublabel">{card.sub}</div>
              <div className="stat-icon material-symbols-outlined">{card.icon}</div>
            </div>
          ))}
        </div>

        {/* Active Filters */}
        {(kpiFilter || chartFilter) && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', color: 'var(--t3)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>filter_alt</span>
            Filtering:
            {kpiFilter && <span style={{ background: 'var(--brand-lt)', color: 'var(--brand)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, textTransform: 'capitalize' }}>{kpiFilter}</span>}
            {chartFilter && <span style={{ background: 'var(--info-bg)', color: 'var(--info)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, textTransform: 'capitalize' }}>{chartFilter}</span>}
            <button onClick={() => { setKpiFilter(null); setChartFilter(null); }} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>✕ Clear</button>
          </div>
        )}

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '20px' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Disaster Heatmap</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ background: 'var(--neutral-bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '3px 10px', fontSize: '11px', fontWeight: 600, color: 'var(--t3)', display: 'flex', gap: '4px' }}>
                  Locations <span style={{color: 'var(--t1)'}}>{totalPoints}</span>
                </div>
                <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-br)', borderRadius: 'var(--r-sm)', padding: '3px 10px', fontSize: '11px', fontWeight: 600, color: 'var(--danger)', display: 'flex', gap: '4px' }}>
                  Critical <span>{criticalCount}</span>
                </div>
                <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success-br)', borderRadius: 'var(--r-sm)', padding: '3px 10px', fontSize: '11px', fontWeight: 600, color: 'var(--success)', display: 'flex', gap: '4px' }}>
                  Volunteers <span>{volPositions.length}</span>
                </div>
              </div>
            </div>

            <div style={{ minHeight: '300px', borderBottom: '1px solid var(--border)', position: 'relative' }}>
              {heatData.length === 0 && volPositions.length === 0 ? (
                <div className="empty-state">
                  <div className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--t4)' }}>map</div>
                  <h3 style={{ fontSize: '15px', color: 'var(--t1)', marginTop: '16px' }}>No location data</h3>
                  <p style={{ fontSize: '13px', color: 'var(--t3)' }}>Heatmap will appear when coordinates are logged.</p>
                </div>
              ) : (
                <MapContainer center={[22.5, 82.0]} zoom={5} minZoom={4} scrollWheelZoom={true}
                  style={{ height: '300px', width: '100%', borderRadius: 0, zIndex: 0 }}>
                  <TileLayer url="https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png" />
                  <MapSearchControl />
                  <LocationMarkers points={heatData} />
                  <VolunteerMarkers volunteers={volPositions} />
                </MapContainer>
              )}
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px' }}>
                  Requests by Type {chartFilter && <span style={{ color: 'var(--brand)', cursor: 'pointer' }} onClick={() => setChartFilter(null)}>(clear)</span>}
                </div>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={typeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#f0f2f5" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--hover)' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={28} onClick={(data) => setChartFilter(prev => prev === data.name ? null : data.name)} style={{ cursor: 'pointer' }}>
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartFilter === entry.name ? TYPE_COLORS[entry.name] || '#6b7280' : chartFilter ? '#d1d5db' : TYPE_COLORS[entry.name] || '#6b7280'} />
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

          {/* Right sidebar cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card">
              <div className="card-header">
                <div className="card-title">Urgent Requests</div>
              </div>
              <div className="card-body" style={{ padding: '0' }}>
                {filteredUrgent.length === 0 ? (
                  <div style={{ padding: '20px', fontSize: '13px', color: 'var(--t4)', textAlign: 'center' }}>No urgent requests</div>
                ) : (
                  filteredUrgent.map(r => (
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
