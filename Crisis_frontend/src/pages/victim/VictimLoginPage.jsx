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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg)' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--danger)', marginBottom: '16px' }}>emergency</div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--t1)', letterSpacing: '-0.02em', marginBottom: '8px' }}>Victim Portal</h1>
        <p style={{ fontSize: '14px', color: 'var(--t3)' }}>Sign in to track your help requests</p>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
        <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-br)', borderRadius: 'var(--r-md)', padding: '12px 16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--danger)' }}>sos</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--danger)' }}>Emergency Portal</div>
            <div style={{ fontSize: '12px', color: 'var(--t2)' }}>Access help request tracking</div>
          </div>
        </div>

        {error && <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-br)', padding: '10px 14px', borderRadius: 'var(--r-md)', marginBottom: '20px', fontSize: '13px' }}>{error}</div>}

        <form onSubmit={submit}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--t2)', marginBottom: '8px' }}>Email address</label>
            <input className="form-control" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handle} required style={{ height: '40px' }} />
          </div>
          
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--t2)', marginBottom: '8px' }}>Password</label>
            <input className="form-control" type="password" name="password" placeholder="••••••••" value={form.password} onChange={handle} required style={{ height: '40px' }} />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', height: '44px', justifyContent: 'center', fontSize: '14px', fontWeight: 600, background: 'var(--danger)', borderColor: 'var(--danger)' }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>

      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', color: 'var(--t3)', marginBottom: '8px' }}>
          New victim? <Link to="/victim/register" style={{ color: 'var(--danger)', fontWeight: 600, textDecoration: 'none' }}>Register here</Link>
        </p>
        <p style={{ fontSize: '13px', color: 'var(--t3)' }}>
          Are you a volunteer? <Link to="/login" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>Volunteer login →</Link>
        </p>
      </div>
    </div>
  );
}
