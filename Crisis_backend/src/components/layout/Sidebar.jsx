import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/app/dashboard',       icon: '⬡', label: 'Dashboard',       roles: ['admin','coordinator','volunteer'] },
  { to: '/app/requests',        icon: '🆘', label: 'Help Requests',   roles: ['admin','coordinator','volunteer'] },
  { to: '/app/volunteers',      icon: '👥', label: 'Volunteers',      roles: ['admin','coordinator'] },
  { to: '/app/assignments',     icon: '📋', label: 'Assignments',     roles: ['admin','coordinator','volunteer'] },
  { to: '/app/victim-requests', icon: '🏥', label: 'Victim Requests', roles: ['admin','coordinator'] },
];

export default function Sidebar() {
  const { user, logout, isAdmin, canManage } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()
    : '??';

  const visible = navItems.filter(n => n.roles.includes(user?.role));

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">🚨</div>
          <div>
            <div className="logo-text">CrisisConnect</div>
            <div className="logo-sub">Relief Ops Platform</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {visible.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        <div className="nav-section-label" style={{ marginTop: 8 }}>Account</div>
        <NavLink
          to="/app/profile"
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="nav-icon">👤</span>
          My Profile
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">⏻</button>
        </div>
      </div>
    </aside>
  );
}
