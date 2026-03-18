import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function VictimLoginPage() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const user = await login(form);
      if (user.role !== 'victim') {
        setError('This portal is for victims only. Please use the main login.');
        localStorage.removeItem('cc_token');
        localStorage.removeItem('cc_user');
        return;
      }
      navigate('/victim/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-grid-bg" />
      <div style={{
        position: 'absolute', top: '20%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 500, height: 300,
        background: 'radial-gradient(ellipse, rgba(244,63,94,.1) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div className="auth-card" style={{ maxWidth: 420 }}>
        {/* Portal header */}
        <div style={{
          background: 'var(--red-bg)', border: '1px solid rgba(244,63,94,.25)',
          borderRadius: 'var(--r)', padding: '10px 14px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <span style={{ fontSize: '1.3rem' }}>🆘</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--red)' }}>Victim Emergency Portal</div>
            <div style={{ fontSize: '.72rem', color: 'var(--text3)' }}>Access help request tracking</div>
          </div>
        </div>

        <div className="auth-logo">
          <div className="auth-logo-icon" style={{ background: 'var(--red)' }}>🚨</div>
          <div>
            <div className="auth-logo-text">CrisisConnect</div>
            <div className="auth-logo-sub">Victim Portal</div>
          </div>
        </div>

        <h2 className="auth-title">Sign in</h2>
        <p className="auth-sub">Track your help requests and get updates</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="form-control" type="email" name="email"
              placeholder="your@email.com" value={form.email} onChange={handle} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" name="password"
              placeholder="••••••••" value={form.password} onChange={handle} required />
          </div>
          <button type="submit" className="btn btn-danger full-width mt-2" disabled={loading}
            style={{ background: 'var(--red)', color: '#fff', justifyContent: 'center' }}>
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>

        <p className="auth-link">
          New victim? <Link to="/victim/register">Register here</Link>
        </p>
        <p className="auth-link" style={{ marginTop: 6 }}>
          Are you a volunteer? <Link to="/login">Volunteer login →</Link>
        </p>
      </div>
    </div>
  );
}
