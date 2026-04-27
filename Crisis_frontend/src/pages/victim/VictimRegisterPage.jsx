import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function VictimRegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    address: '', district: '', state: '',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate     = useNavigate();

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await register({ ...form, role: 'victim' });
      navigate('/victim/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg)' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--danger)', marginBottom: '16px' }}>emergency</div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--t1)', letterSpacing: '-0.02em', marginBottom: '8px' }}>Victim Portal</h1>
        <p style={{ fontSize: '14px', color: 'var(--t3)' }}>Register to request help and track updates</p>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '32px' }}>
        <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-br)', borderRadius: 'var(--r-md)', padding: '12px 16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--danger)' }}>sos</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--danger)' }}>Emergency Portal</div>
            <div style={{ fontSize: '12px', color: 'var(--t2)' }}>Create an account to submit SOS requests</div>
          </div>
        </div>

        {error && <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-br)', padding: '10px 14px', borderRadius: 'var(--r-md)', marginBottom: '20px', fontSize: '13px' }}>{error}</div>}

        <form onSubmit={submit}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--t2)', marginBottom: '8px' }}>Full Name *</label>
              <input className="form-control" name="name" placeholder="John Doe" value={form.name} onChange={handle} required style={{ height: '40px' }} />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--t2)', marginBottom: '8px' }}>Phone</label>
              <input className="form-control" name="phone" placeholder="9XXXXXXXXX" value={form.phone} onChange={handle} style={{ height: '40px' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--t2)', marginBottom: '8px' }}>Email address *</label>
            <input className="form-control" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handle} required style={{ height: '40px' }} />
          </div>
          
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--t2)', marginBottom: '8px' }}>Password *</label>
            <input className="form-control" type="password" name="password" placeholder="Min 6 characters" value={form.password} onChange={handle} required style={{ height: '40px' }} />
          </div>

          <div style={{ height: '1px', background: 'var(--border)', margin: '0 -32px 24px -32px' }} />
          
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--t4)', marginBottom: '16px', fontWeight: 600 }}>Your Location</div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--t2)', marginBottom: '8px' }}>Address</label>
            <input className="form-control" name="address" placeholder="Street / Village / Area" value={form.address} onChange={handle} style={{ height: '40px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--t2)', marginBottom: '8px' }}>District</label>
              <input className="form-control" name="district" placeholder="District" value={form.district} onChange={handle} style={{ height: '40px' }} />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--t2)', marginBottom: '8px' }}>State</label>
              <input className="form-control" name="state" placeholder="State" value={form.state} onChange={handle} style={{ height: '40px' }} />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', height: '44px', justifyContent: 'center', fontSize: '14px', fontWeight: 600, background: 'var(--danger)', borderColor: 'var(--danger)' }}>
            {loading ? 'Creating account…' : 'Register & Request Help'}
          </button>
        </form>
      </div>

      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', color: 'var(--t3)', marginBottom: '8px' }}>
          Already registered? <Link to="/victim/login" style={{ color: 'var(--danger)', fontWeight: 600, textDecoration: 'none' }}>Sign in here</Link>
        </p>
        <p style={{ fontSize: '13px', color: 'var(--t3)' }}>
          Are you a volunteer? <Link to="/login" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>Volunteer login →</Link>
        </p>
      </div>
    </div>
  );
}
