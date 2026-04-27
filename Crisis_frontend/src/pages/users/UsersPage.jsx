import { useState, useEffect, useCallback } from 'react';
import { usersAPI } from '../../api';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import VolunteerDetail from '../volunteers/VolunteerDetail';

const ROLES = ['admin', 'coordinator', 'volunteer', 'victim'];

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ role: '', isActive: '' });
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [viewItem, setViewItem] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (filters.role) params.role = filters.role;
      if (filters.isActive !== '') params.isActive = filters.isActive;
      const { data } = await usersAPI.getAll(params);
      setUsers(data.data.docs || data.data || []);
    } catch { setError('Failed to load users'); } 
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (id) => {
    try { await usersAPI.toggleStatus(id); load(); }
    catch (e) { alert(e.response?.data?.message || 'Failed to toggle status'); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try { await usersAPI.delete(id); load(); }
    catch (e) { alert(e.response?.data?.message || 'Failed to delete user'); }
  };

  const updateRole = async (id, newRole) => {
    try { await usersAPI.update(id, { role: newRole }); load(); }
    catch (e) { alert(e.response?.data?.message || 'Failed to update role'); }
  };

  const filtered = users.filter(u =>
    u._id !== currentUser?._id &&
    (!search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const totalUsers = filtered.length;
  const activeUsers = filtered.filter(u => u.isActive).length;

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>User Management</h1>
          <p>Manage users, assign roles, and handle account statuses</p>
        </div>
      </div>
      
      <div className="page-body page-enter">
        {error && <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-br)', padding: '12px 16px', borderRadius: 'var(--r-md)' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          
          {/* Main Table Column */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="table-wrapper">
              {loading ? (
                <div style={{ padding: '60px 0' }}><Loader /></div>
              ) : filtered.length === 0 ? (
                <div className="empty-state">
                  <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--t4)', marginBottom: '16px' }}>group_off</span>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--t1)', marginBottom: '6px' }}>No users found</div>
                  <div style={{ fontSize: '13px', color: 'var(--t3)' }}>Adjust your filters to see more results.</div>
                </div>
              ) : (
                <div style={{ overflow: 'auto', maxHeight: 'calc(100vh - 200px)', borderRadius: 'var(--r-xl)' }}>
                  <table style={{ minWidth: '700px' }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Last Active</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(u => (
                        <tr key={u._id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--neutral-bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, color: 'var(--t2)' }}>
                                {u.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                              </div>
                              <div>
                                <div className="td-primary">{u.name}</div>
                                <div className="td-secondary">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <select
                              className="form-control"
                              style={{ padding: '4px 8px', fontSize: '12px', minWidth: '120px' }}
                              value={u.role}
                              onChange={(e) => updateRole(u._id, e.target.value)}
                              disabled={u.role === 'victim'}
                            >
                              {ROLES.map(r => {
                                if (r === 'victim' && u.role !== 'victim') return null;
                                return <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>;
                              })}
                            </select>
                          </td>
                          <td>
                            <div style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 'var(--r-xs)', fontSize: '11px', fontWeight: 600, background: u.isActive ? 'var(--success-bg)' : 'var(--danger-bg)', color: u.isActive ? 'var(--success)' : 'var(--danger)', border: `1px solid ${u.isActive ? 'var(--success-br)' : 'var(--danger-br)'}` }}>
                              {u.isActive ? 'Active' : 'Inactive'}
                            </div>
                          </td>
                          <td>
                            <div className="td-primary" style={{ fontSize: '12px' }}>
                              {u.lastActiveAt ? new Date(u.lastActiveAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Never'}
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                              <button className="btn-icon" onClick={() => setViewItem(u)} title="View Profile">
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
                              </button>
                              <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => toggleStatus(u._id)}>
                                {u.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button className="btn-icon danger" onClick={() => deleteUser(u._id)} title="Delete">
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div style={{ width: '260px', flexShrink: 0, position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div className="card">
              <div className="card-header">
                <div className="card-title">Overview</div>
              </div>
              <div className="card-body" style={{ padding: '12px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--t3)' }}>Total Users</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t1)' }}>{totalUsers}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span style={{ fontSize: '13px', color: 'var(--t3)' }}>Active Accounts</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--success)' }}>{activeUsers}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Quick Filters</div>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: 'var(--t4)' }}>search</span>
                  <input
                    className="form-control"
                    style={{ paddingLeft: '32px', fontSize: '12px', padding: '7px 10px 7px 32px' }}
                    placeholder="Search users..."
                    value={search} onChange={e => setSearch(e.target.value)}
                  />
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                  <button className={`badge-pill ${filters.role === '' ? 'info' : 'pending'}`} style={{ cursor: 'pointer' }} onClick={() => setFilters(f => ({...f, role: ''}))}>All Roles</button>
                  {ROLES.map(r => (
                    <button key={r} className={`badge-pill ${filters.role === r ? 'info' : 'pending'}`} style={{ cursor: 'pointer' }} onClick={() => setFilters(f => ({...f, role: r}))}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {viewItem && (
        <Modal title="User Profile" onClose={() => setViewItem(null)}>
          <VolunteerDetail volunteerId={viewItem._id} onClose={() => setViewItem(null)} />
        </Modal>
      )}
    </>
  );
}
