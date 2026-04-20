import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate   = useNavigate();

  const [form, setForm]       = useState({ password: '', confirmPassword: '' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(token, { password: form.password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. The link may have expired.');
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

        <h2 className="auth-title">Reset Password</h2>
        <p className="auth-sub">Choose a new password for your account</p>

        {error && <div className="alert alert-error">{error}</div>}

        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
            <p style={{ color: 'var(--green)', fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>
              Password reset successful!
            </p>
            <p style={{ color: 'var(--text2)', fontSize: '.85rem', marginBottom: 20 }}>
              Redirecting you to sign in…
            </p>
            <Link to="/login" className="btn btn-primary full-width">
              Sign in now →
            </Link>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input className="form-control" type="password" name="password"
                placeholder="Min 6 characters" value={form.password} onChange={handle} required minLength={6} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className="form-control" type="password" name="confirmPassword"
                placeholder="Re-enter password" value={form.confirmPassword} onChange={handle} required minLength={6} />
            </div>
            <button type="submit" className="btn btn-primary full-width mt-2" disabled={loading}>
              {loading ? 'Resetting…' : 'Reset Password →'}
            </button>
          </form>
        )}

        <p className="auth-link">
          <Link to="/login">← Back to Sign in</Link>
        </p>

        <div className="divider" />
      </div>
    </div>
  );
}
