import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../api';
import Logo from '../../components/common/Logo';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(token, { newPassword: password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed. The token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg)' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
          <Logo size="large" link={false} />
        </div>
        <p style={{ fontSize: '14px', color: 'var(--t3)' }}>Create a new password for your account</p>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
        {error && <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-br)', padding: '10px 14px', borderRadius: 'var(--r-md)', marginBottom: '20px', fontSize: '13px' }}>{error}</div>}

        {!success ? (
          <form onSubmit={submit}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--t2)', marginBottom: '8px' }}>New Password</label>
              <input className="form-control" type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ height: '40px' }} />
            </div>
            
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--t2)', marginBottom: '8px' }}>Confirm Password</label>
              <input className="form-control" type="password" placeholder="Repeat new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={{ height: '40px' }} />
            </div>
            
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', height: '44px', justifyContent: 'center', fontSize: '14px', fontWeight: 600 }}>
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--success)', marginBottom: '16px' }}>check_circle</div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--t1)', marginBottom: '8px' }}>Password Reset Successful</h3>
            <p style={{ color: 'var(--t2)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
              Your password has been successfully updated. You can now sign in with your new credentials.
            </p>
            <Link to="/login" className="btn-primary" style={{ display: 'inline-flex', width: '100%', height: '44px', justifyContent: 'center', alignItems: 'center', fontSize: '14px', fontWeight: 600 }}>
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
