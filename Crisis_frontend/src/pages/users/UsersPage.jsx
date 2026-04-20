import { useState, useEffect, useCallback } from 'react';
import { usersAPI } from '../../api';
import PageHeader from '../../components/layout/PageHeader';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../context/AuthContext';

const ROLES = ['admin', 'coordinator', 'volunteer', 'victim'];

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ role: '', isActive: '' });
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 }; // Get enough users for demo
      if (filters.role) params.role = filters.role;
      if (filters.isActive !== '') params.isActive = filters.isActive;
      const { data } = await usersAPI.getAll(params);
      setUsers(data.data.docs || data.data || []);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (id) => {
    try {
      await usersAPI.toggleStatus(id);
      load();
    } catch (e) { alert(e.response?.data?.message || 'Failed to toggle status'); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await usersAPI.delete(id);
      load();
    } catch (e) { alert(e.response?.data?.message || 'Failed to delete user'); }
  };

  const updateRole = async (id, newRole) => {
    try {
      await usersAPI.update(id, { role: newRole });
      load();
    } catch (e) { alert(e.response?.data?.message || 'Failed to update role'); }
  };

  const filtered = users.filter(u =>
    u._id !== currentUser?._id &&
    (!search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <PageHeader
        title="User Management"
        subtitle="Manage users, assign roles, and handle account statuses"
      />
      <div className="page-body page-enter">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="filters-bar">
          <input
            className="form-control search-input"
            placeholder="🔍  Search by name or email…"
            value={search} onChange={e => setSearch(e.target.value)}
          />
          <select className="form-control" value={filters.role}
            onChange={e => setFilters(f => ({ ...f, role: e.target.value }))}>
            <option value="">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
          <select className="form-control" value={filters.isActive}
            onChange={e => setFilters(f => ({ ...f, isActive: e.target.value }))}>
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          {(filters.role || filters.isActive || search) && (
            <button className="btn btn-ghost btn-sm"
              onClick={() => { setFilters({ role: '', isActive: '' }); setSearch(''); }}>
              ✕ Clear
            </button>
          )}
        </div>

        {loading ? <Loader /> : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <p>No users found</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="table" style={{ margin: 0 }}>
                <thead>
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
                        <div style={{ fontWeight: 600 }}>{u.name}</div>
                        <div style={{ fontSize: '.8rem', color: 'var(--text3)' }}>{u.email}</div>
                      </td>
                      <td>
                        <select
                          className="form-control"
                          style={{ minWidth: 120, padding: '4px 8px' }}
                          value={u.role}
                          onChange={(e) => updateRole(u._id, e.target.value)}
                          disabled={u._id === currentUser?._id || u.role === 'victim'}
                        >
                          {ROLES.map(r => {
                            // Don't show 'victim' as an option to assign if they aren't already one
                            if (r === 'victim' && u.role !== 'victim') return null;
                            return <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>;
                          })}
                        </select>
                      </td>
                      <td>
                        <div style={{
                          display: 'inline-block',
                          padding: '4px 8px', borderRadius: 20, fontSize: '.75rem', fontWeight: 600,
                          background: u.isActive ? 'var(--green-bg)' : 'var(--red-bg)',
                          color: u.isActive ? 'var(--green)' : 'var(--red)'
                        }}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </td>
                      <td style={{ fontSize: '.85rem', color: 'var(--text2)' }}>
                        {u.lastActiveAt
                          ? new Date(u.lastActiveAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                          : new Date(u.createdAt).toLocaleString('en-IN', { dateStyle: 'medium' })}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            className={`btn btn-sm ${u.isActive ? 'btn-ghost' : 'btn-success'}`}
                            onClick={() => toggleStatus(u._id)}
                            disabled={u._id === currentUser?._id}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            className="btn btn-sm" style={{ background: 'var(--red-bg)', color: 'var(--red)' }}
                            onClick={() => deleteUser(u._id)}
                            disabled={u._id === currentUser?._id}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
