import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../api';

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('');
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const { data } = await authAPI.forgotPassword({ email });
      setSuccess(data.message || 'Password reset email sent! Check your inbox.');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg)' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--brand)', marginBottom: '16px' }}>lock_reset</div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--t1)', letterSpacing: '-0.02em', marginBottom: '8px' }}>Forgot Password</h1>
        <p style={{ fontSize: '14px', color: 'var(--t3)' }}>Enter your email and we'll send a reset link</p>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
        {error && <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-br)', padding: '10px 14px', borderRadius: 'var(--r-md)', marginBottom: '20px', fontSize: '13px' }}>{error}</div>}
        {success && <div style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-br)', padding: '10px 14px', borderRadius: 'var(--r-md)', marginBottom: '20px', fontSize: '13px' }}>{success}</div>}

        {!success ? (
          <form onSubmit={submit}>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--t2)', marginBottom: '8px' }}>Email address</label>
              <input className="form-control" type="email" name="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ height: '40px' }} />
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', height: '44px', justifyContent: 'center', fontSize: '14px', fontWeight: 600 }}>
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--brand)', marginBottom: '16px' }}>forward_to_inbox</div>
            <p style={{ color: 'var(--t2)', fontSize: '14px', marginBottom: '20px', lineHeight: 1.5 }}>
              Check your email for the password reset link. The link will expire in 15 minutes.
            </p>
            <button className="btn-ghost" onClick={() => { setSuccess(''); setEmail(''); }} style={{ width: '100%', height: '40px', justifyContent: 'center' }}>
              Send again
            </button>
          </div>
        )}
      </div>

      <p style={{ marginTop: '32px', fontSize: '13px', color: 'var(--t3)' }}>
        Remember your password? <Link to="/login" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
      </p>
    </div>
  );
}
