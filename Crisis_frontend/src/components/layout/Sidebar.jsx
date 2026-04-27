import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/app/dashboard',       icon: 'space_dashboard', label: 'Dashboard',       roles: ['admin','coordinator','volunteer'] },
  { to: '/app/requests',        icon: 'emergency',       label: 'Help Requests',   roles: ['admin','coordinator','volunteer'] },
  { to: '/app/users',           icon: 'manage_accounts', label: 'User Management', roles: ['admin'] },
  { to: '/app/coordinator-applications', icon: 'assignment_ind', label: 'Applications', roles: ['admin'] },
  { to: '/app/volunteers',      icon: 'groups',          label: 'Volunteers',      roles: ['admin','coordinator'] },
  { to: '/app/assignments',     icon: 'assignment',      label: 'Assignments',     roles: ['coordinator','volunteer'] },
  { to: '/app/victim-requests', icon: 'local_hospital',  label: 'Victim Requests', roles: ['coordinator'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()
    : '??';

  const visible = navItems.filter(n => n.roles.includes(user?.role));

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon material-symbols-outlined">shield</div>
        <div className="sidebar-logo-text">CrisisConnect</div>
      </div>

      <div className="nav-sections">
        <div className="nav-section-label">Navigation</div>
        {visible.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        <div className="nav-section-label">Account</div>
        <NavLink
          to="/app/profile"
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="material-symbols-outlined">person</span>
          My Profile
        </NavLink>
      </div>

      <div className="user-card">
        <div className="user-avatar">{initials}</div>
        <div className="user-info">
          <div className="user-name">{user?.name}</div>
          <div className="user-role">{user?.role}</div>
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          <span className="material-symbols-outlined">power_settings_new</span>
        </button>
      </div>
    </aside>
  );
}
