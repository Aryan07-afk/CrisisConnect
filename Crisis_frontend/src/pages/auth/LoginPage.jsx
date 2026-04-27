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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg)' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--brand)', marginBottom: '16px' }}>emergency</div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--t1)', letterSpacing: '-0.02em', marginBottom: '8px' }}>Sign in to CrisisConnect</h1>
        <p style={{ fontSize: '14px', color: 'var(--t3)' }}>Enter your credentials to access the relief platform</p>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
        {error && <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-br)', padding: '10px 14px', borderRadius: 'var(--r-md)', marginBottom: '20px', fontSize: '13px' }}>{error}</div>}

        <form onSubmit={submit}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--t2)', marginBottom: '8px' }}>Email address</label>
            <input className="form-control" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handle} required style={{ height: '40px' }} />
          </div>
          
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t2)', margin: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '12px', color: 'var(--brand)', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</Link>
            </div>
            <input className="form-control" type="password" name="password" placeholder="••••••••" value={form.password} onChange={handle} required style={{ height: '40px' }} />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', height: '44px', justifyContent: 'center', fontSize: '14px', fontWeight: 600 }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>

      <p style={{ marginTop: '32px', fontSize: '13px', color: 'var(--t3)' }}>
        No account? <Link to="/register" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>Register here</Link>
      </p>
    </div>
  );
}
