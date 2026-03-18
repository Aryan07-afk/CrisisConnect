import { useState, useEffect, useCallback } from 'react';
import { volunteersAPI } from '../../api';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/common/Badge';
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
      <PageHeader
        title="Volunteers"
        subtitle="Manage field volunteers and their availability"
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.75rem', color: 'var(--text3)' }}>
              {volunteers.filter(v => v.isAvailable).length} / {volunteers.length} available
            </span>
          </div>
        }
      />
      <div className="page-body page-enter">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="filters-bar">
          <input
            className="form-control search-input"
            placeholder="🔍  Search by name, email, org…"
            value={search} onChange={e => setSearch(e.target.value)}
          />
          <select className="form-control" value={filters.isAvailable}
            onChange={e => setFilters(f => ({ ...f, isAvailable: e.target.value }))}>
            <option value="">All Availability</option>
            <option value="true">Available</option>
            <option value="false">Busy</option>
          </select>
          <select className="form-control" value={filters.skill}
            onChange={e => setFilters(f => ({ ...f, skill: e.target.value }))}>
            {SKILLS.map(s => <option key={s} value={s}>{s || 'All Skills'}</option>)}
          </select>
          {(filters.isAvailable || filters.skill || search) && (
            <button className="btn btn-ghost btn-sm"
              onClick={() => { setFilters({ isAvailable: '', skill: '' }); setSearch(''); }}>
              ✕ Clear
            </button>
          )}
        </div>

        {loading ? <Loader /> : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <p>No volunteers found</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {filtered.map(v => (
              <div key={v._id} className="card" style={{ cursor: 'pointer', transition: 'border-color .2s, transform .2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: v.isAvailable ? 'var(--green-bg)' : 'var(--yellow-bg)',
                    border: `1px solid ${v.isAvailable ? 'rgba(16,185,129,.3)' : 'rgba(245,158,11,.3)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '.85rem',
                    color: v.isAvailable ? 'var(--green)' : 'var(--yellow)', flexShrink: 0
                  }}>
                    {v.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: 2 }}>{v.name}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--text3)' }}>{v.email}</div>
                  </div>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', marginTop: 6, flexShrink: 0,
                    background: v.isAvailable ? 'var(--green)' : 'var(--yellow)',
                    boxShadow: v.isAvailable ? '0 0 6px var(--green)' : 'none'
                  }} />
                </div>

                {v.organization && (
                  <div style={{ fontSize: '.78rem', color: 'var(--text2)', marginBottom: 8 }}>
                    🏢 {v.organization}
                  </div>
                )}
                {v.location && (
                  <div style={{ fontSize: '.78rem', color: 'var(--text2)', marginBottom: 8 }}>
                    📍 {v.location}
                  </div>
                )}

                {v.skills?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
                    {v.skills.map(s => (
                      <span key={s} style={{
                        padding: '2px 8px', borderRadius: 20,
                        background: 'var(--bg4)', border: '1px solid var(--border2)',
                        fontSize: '.68rem', color: 'var(--text2)',
                        fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.05em'
                      }}>{s}</span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}
                    onClick={() => setViewItem(v)}>
                    View Profile
                  </button>
                  <button
                    className={`btn btn-sm ${v.isAvailable ? 'btn-ghost' : 'btn-success'}`}
                    onClick={() => toggleAvailability(v._id)}>
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
