import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function VictimLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/victim/login'); };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  return (
    <div className="app-shell">
      {/* Victim Sidebar */}
      <aside className="sidebar" style={{ '--sidebar-accent': 'var(--red)' }}>
        <div className="sidebar-logo">
          <div className="logo-mark">
            <div className="logo-icon" style={{ background: 'var(--red)', boxShadow: '0 0 20px rgba(244,63,94,.3)' }}>🆘</div>
            <div>
              <div className="logo-text">CrisisConnect</div>
              <div className="logo-sub">Victim Portal</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">My Help</div>

          <NavLink to="/victim/dashboard"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            style={({ isActive }) => isActive ? { color: 'var(--red)', background: 'var(--red-bg)' } : {}}>
            <span className="nav-icon">🏠</span> Dashboard
          </NavLink>

          <NavLink to="/victim/submit"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            style={({ isActive }) => isActive ? { color: 'var(--red)', background: 'var(--red-bg)' } : {}}>
            <span className="nav-icon">🆘</span> Submit SOS Request
          </NavLink>

          <NavLink to="/victim/requests"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            style={({ isActive }) => isActive ? { color: 'var(--red)', background: 'var(--red-bg)' } : {}}>
            <span className="nav-icon">📋</span> My Requests
          </NavLink>

          <NavLink to="/victim/profile"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            style={({ isActive }) => isActive ? { color: 'var(--red)', background: 'var(--red-bg)' } : {}}>
            <span className="nav-icon">👤</span> My Profile
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar" style={{ borderColor: 'var(--red)', color: 'var(--red)', background: 'var(--red-bg)' }}>
              {initials}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role" style={{ color: 'var(--red)' }}>victim</div>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Logout">⏻</button>
          </div>
        </div>
      </aside>

      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}
