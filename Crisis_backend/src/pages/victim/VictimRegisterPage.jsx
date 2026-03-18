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
    <div className="auth-page">
      <div className="auth-grid-bg" />
      <div style={{
        position: 'absolute', top: '20%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 500, height: 300,
        background: 'radial-gradient(ellipse, rgba(244,63,94,.1) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div style={{
          background: 'var(--red-bg)', border: '1px solid rgba(244,63,94,.25)',
          borderRadius: 'var(--r)', padding: '10px 14px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <span style={{ fontSize: '1.3rem' }}>🆘</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--red)' }}>Victim Emergency Portal</div>
            <div style={{ fontSize: '.72rem', color: 'var(--text3)' }}>Register to request help</div>
          </div>
        </div>

        <div className="auth-logo">
          <div className="auth-logo-icon" style={{ background: 'var(--red)' }}>🚨</div>
          <div>
            <div className="auth-logo-text">CrisisConnect</div>
            <div className="auth-logo-sub">Victim Portal</div>
          </div>
        </div>

        <h2 className="auth-title">Register for Help</h2>
        <p className="auth-sub">Create an account to submit and track your help requests</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-control" name="name" placeholder="Your full name"
                value={form.name} onChange={handle} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-control" name="phone" placeholder="9XXXXXXXXX"
                value={form.phone} onChange={handle} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className="form-control" type="email" name="email"
              placeholder="your@email.com" value={form.email} onChange={handle} required />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input className="form-control" type="password" name="password"
              placeholder="Min 6 characters" value={form.password} onChange={handle} required />
          </div>

          <div className="divider" />
          <div style={{ fontSize: '.72rem', color: 'var(--text3)', marginBottom: 10, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
            Your Location
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <input className="form-control" name="address" placeholder="Street / Village / Area"
              value={form.address} onChange={handle} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">District</label>
              <input className="form-control" name="district" placeholder="District"
                value={form.district} onChange={handle} />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input className="form-control" name="state" placeholder="State"
                value={form.state} onChange={handle} />
            </div>
          </div>

          <button type="submit" className="btn full-width mt-2" disabled={loading}
            style={{ background: 'var(--red)', color: '#fff', justifyContent: 'center' }}>
            {loading ? 'Creating account…' : 'Register & Request Help →'}
          </button>
        </form>

        <p className="auth-link">
          Already registered? <Link to="/victim/login">Sign in here</Link>
        </p>
        <p className="auth-link" style={{ marginTop: 6 }}>
          Are you a volunteer? <Link to="/login">Volunteer login →</Link>
        </p>
      </div>
    </div>
  );
}
