import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-grid-bg" />
      <div className="auth-glow" />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🚨</div>
          <div>
            <div className="auth-logo-text">CrisisConnect</div>
            <div className="auth-logo-sub">Relief Ops Platform</div>
          </div>
        </div>

        <h2 className="auth-title">Sign in</h2>
        <p className="auth-sub">Enter your credentials to access the platform</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="form-control" type="email" name="email"
              placeholder="you@org.com" value={form.email} onChange={handle} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" name="password"
              placeholder="••••••••" value={form.password} onChange={handle} required />
          </div>
          <button type="submit" className="btn btn-primary full-width mt-2" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>

        <p className="auth-link">
          No account? <Link to="/register">Register here</Link>
        </p>

        <div className="divider" />
        <p style={{ fontSize: '.72rem', color: 'var(--text3)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
          Demo: admin@crisisconnect.com / admin123
        </p>
      </div>
    </div>
  );
}
