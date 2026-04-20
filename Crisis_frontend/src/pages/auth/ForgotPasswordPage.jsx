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

        <h2 className="auth-title">Forgot Password</h2>
        <p className="auth-sub">Enter your email and we'll send you a link to reset your password</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {!success ? (
          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-control" type="email" name="email"
                placeholder="you@org.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary full-width mt-2" disabled={loading}>
              {loading ? 'Sending…' : 'Send Reset Link →'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📧</div>
            <p style={{ color: 'var(--text2)', fontSize: '.9rem', marginBottom: 20 }}>
              Check your email for the password reset link. The link will expire in 15 minutes.
            </p>
            <button className="btn btn-ghost full-width" onClick={() => { setSuccess(''); setEmail(''); }}>
              Send again
            </button>
          </div>
        )}

        <p className="auth-link">
          Remember your password? <Link to="/login">Sign in</Link>
        </p>

        <div className="divider" />
      </div>
    </div>
  );
}
