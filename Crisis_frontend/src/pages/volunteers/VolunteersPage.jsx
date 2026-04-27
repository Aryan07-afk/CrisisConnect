import { useState, useEffect, useCallback } from 'react';
import { volunteersAPI } from '../../api';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import VolunteerDetail from './VolunteerDetail';

const SKILLS = ['','medical','rescue','logistics','communication','general'];

export default function VolunteersPage() {
  const [volunteers, setVols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ isAvailable: '', skill: '' });
  const [search, setSearch]   = useState('');
  const [viewItem, setViewItem] = useState(null);
  const [error, setError]     = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.isAvailable !== '') params.isAvailable = filters.isAvailable;
      if (filters.skill)              params.skill = filters.skill;
      const { data } = await volunteersAPI.getAll(params);
      setVols(data.data);
    } catch { setError('Failed to load volunteers'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const toggleAvailability = async (id) => {
    try {
      await volunteersAPI.toggleAvailability(id);
      load();
    } catch (e) { alert(e.response?.data?.message || 'Failed'); }
  };

  const filtered = volunteers.filter(v =>
    !search ||
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.email.toLowerCase().includes(search.toLowerCase()) ||
    v.organization?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>Volunteers</h1>
          <p>Manage field volunteers and their availability</p>
        </div>
        <div className="topbar-right">
          <span style={{ fontSize: '12px', color: 'var(--t3)' }}>
            <strong style={{ color: 'var(--t1)' }}>{volunteers.filter(v => v.isAvailable).length}</strong> available out of {volunteers.length}
          </span>
        </div>
      </div>
      
      <div className="page-body page-enter">
        {error && <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-br)', padding: '12px 16px', borderRadius: 'var(--r-md)' }}>{error}</div>}

        {/* Filter Strip */}
        <div className="filter-strip">
          <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: 'var(--t4)' }}>search</span>
            <input
              className="form-control"
              style={{ paddingLeft: '36px' }}
              placeholder="Search by name, email, org…"
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="form-control" style={{ width: 'fit-content', minWidth: '140px' }} value={filters.isAvailable} onChange={e => setFilters(f => ({ ...f, isAvailable: e.target.value }))}>
            <option value="">All Availability</option>
            <option value="true">Available</option>
            <option value="false">Busy</option>
          </select>
          <select className="form-control" style={{ width: 'fit-content', minWidth: '140px' }} value={filters.skill} onChange={e => setFilters(f => ({ ...f, skill: e.target.value }))}>
            {SKILLS.map(s => <option key={s} value={s}>{s || 'All Skills'}</option>)}
          </select>
          {(filters.isAvailable || filters.skill || search) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setFilters({ isAvailable: '', skill: '' }); setSearch(''); }}>
              ✕ Clear
            </button>
          )}
        </div>

        {loading ? <div style={{ padding: '60px 0' }}><Loader /></div> : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--t4)', marginBottom: '16px' }}>group_off</span>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--t1)', marginBottom: '6px' }}>No volunteers found</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            {filtered.map(v => (
              <div key={v._id} className="card" style={{ position: 'relative', padding: '18px', display: 'flex', flexDirection: 'column' }}>
                {/* Top Accent Strip */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', borderRadius: 'var(--r-xl) var(--r-xl) 0 0', background: v.isAvailable ? 'var(--success)' : 'var(--warning)' }} />
                
                {/* Row 1: Avatar, Name, Dot */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--neutral-bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: 'var(--t2)', flexShrink: 0 }}>
                    {v.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--t1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--t4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.email}</div>
                  </div>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: v.isAvailable ? 'var(--success)' : 'var(--warning)', flexShrink: 0, marginTop: '4px' }} />
                </div>

                {/* Row 2: Location */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--t3)', marginBottom: '12px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>pin_drop</span>
                  {v.location || 'Location not set'}
                </div>

                {/* Row 3: Skills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px', flex: 1 }}>
                  {(v.skills && v.skills.length > 0) ? v.skills.map(s => (
                    <span key={s} style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.04em', padding: '2px 8px', borderRadius: 'var(--r-xs)', background: 'var(--neutral-bg)', color: 'var(--t3)', border: '1px solid var(--border)', textTransform: 'uppercase' }}>
                      {s}
                    </span>
                  )) : (
                    <span style={{ fontSize: '10px', color: 'var(--t4)' }}>No specific skills listed</span>
                  )}
                </div>

                {/* Row 4: Actions */}
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: 'auto' }}>
                  <button className="btn-ghost" style={{ flex: 1, padding: '6px 0', fontSize: '12px', justifyContent: 'center' }} onClick={() => setViewItem(v)}>
                    View Profile
                  </button>
                  <button
                    className="btn"
                    style={{ flex: 1, padding: '6px 0', fontSize: '12px', justifyContent: 'center', background: v.isAvailable ? 'var(--warning-bg)' : 'var(--success-bg)', color: v.isAvailable ? 'var(--warning)' : 'var(--success)', border: `1px solid ${v.isAvailable ? 'var(--warning-br)' : 'var(--success-br)'}` }}
                    onClick={() => toggleAvailability(v._id)}
                  >
                    {v.isAvailable ? 'Mark Busy' : 'Mark Free'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {viewItem && (
        <Modal title="Volunteer Profile" onClose={() => setViewItem(null)}>
          <VolunteerDetail volunteerId={viewItem._id} onClose={() => setViewItem(null)} />
        </Modal>
      )}
    </>
  );
}
