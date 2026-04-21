import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';

import HomePage     from './pages/home/HomePage';
import LoginPage    from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage  from './pages/auth/ResetPasswordPage';
import DashboardPage        from './pages/dashboard/DashboardPage';
import RequestsPage         from './pages/requests/RequestsPage';
import VolunteersPage       from './pages/volunteers/VolunteersPage';
import AssignmentsPage      from './pages/assignments/AssignmentsPage';
import ProfilePage          from './pages/auth/ProfilePage';
import VictimRequestsAdmin  from './pages/victim/VictimRequestsAdmin';
import UsersPage            from './pages/users/UsersPage';
import CoordinatorApplicationsPage from './pages/users/CoordinatorApplicationsPage';

import VictimLayout         from './pages/victim/VictimLayout';
import VictimLoginPage      from './pages/victim/VictimLoginPage';
import VictimRegisterPage   from './pages/victim/VictimRegisterPage';
import VictimDashboard      from './pages/victim/VictimDashboard';
import VictimSubmitRequest  from './pages/victim/VictimSubmitRequest';
import VictimRequestsPage   from './pages/victim/VictimRequestsPage';
import VictimProfilePage    from './pages/victim/VictimProfilePage';

/* ── Route guards ──────────────────────────────────── */
function PrivateRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'victim' ? '/victim/dashboard' : '/app/dashboard'} replace />;
  }
  return children;
}

function GuestRoute({ children }) {
  const { user } = useAuth();
  if (!user) return children;
  return <Navigate to={user.role === 'victim' ? '/victim/dashboard' : '/app/dashboard'} replace />;
}

function VictimRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/victim/login" replace />;
  if (user.role !== 'victim') return <Navigate to="/app/dashboard" replace />;
  return children;
}

/* ── App ───────────────────────────────────────────── */
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* ── Public ── */}
        <Route path="/"         element={<HomePage />} />
        <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/forgot-password"       element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
        <Route path="/reset-password/:token" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />

        {/* ── Victim public ── */}
        <Route path="/victim/login"    element={<GuestRoute><VictimLoginPage /></GuestRoute>} />
        <Route path="/victim/register" element={<GuestRoute><VictimRegisterPage /></GuestRoute>} />

        {/* ── Victim portal (victim-only) ── */}
        <Route path="/victim" element={<VictimRoute><VictimLayout /></VictimRoute>}>
          <Route index element={<Navigate to="/victim/dashboard" replace />} />
          <Route path="dashboard" element={<VictimDashboard />} />
          <Route path="submit"    element={<VictimSubmitRequest />} />
          <Route path="requests"  element={<VictimRequestsPage />} />
          <Route path="profile"   element={<VictimProfilePage />} />
        </Route>

        {/* ── Main ops app (admin / coordinator / volunteer) ── */}
        <Route path="/app" element={
          <PrivateRoute allowedRoles={['admin','coordinator','volunteer']}>
            <AppLayout />
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard"       element={<DashboardPage />} />
          <Route path="requests"        element={<RequestsPage />} />
          <Route path="volunteers"      element={<VolunteersPage />} />
          <Route path="assignments"     element={<AssignmentsPage />} />
          <Route path="victim-requests" element={<VictimRequestsAdmin />} />
          <Route path="users"           element={<PrivateRoute allowedRoles={['admin']}><UsersPage /></PrivateRoute>} />
          <Route path="coordinator-applications" element={<PrivateRoute allowedRoles={['admin']}><CoordinatorApplicationsPage /></PrivateRoute>} />
          <Route path="profile"         element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
