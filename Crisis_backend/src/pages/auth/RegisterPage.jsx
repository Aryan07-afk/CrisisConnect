import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SKILLS = ['medical','rescue','logistics','communication','general'];

export default function RegisterPage() {
  const [form, setForm] = useState({
    name:'', email:'', password:'', role:'volunteer',
    phone:'', organization:'', location:'', skills:[]
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const toggleSkill = (s) => setForm(f => ({
    ...f,
    skills: f.skills.includes(s) ? f.skills.filter(x=>x!==s) : [...f.skills, s]
  }));

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-grid-bg" />
      <div className="auth-glow" />
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-logo">
          <div className="auth-logo-icon">🚨</div>
          <div>
            <div className="auth-logo-text">CrisisConnect</div>
            <div className="auth-logo-sub">Create Account</div>
          </div>
        </div>

        <h2 className="auth-title">Register</h2>
        <p className="auth-sub">Join the platform to help coordinate relief operations</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-control" name="name" placeholder="Aryan Dhoundiyal"
                value={form.name} onChange={handle} required />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-control" name="role" value={form.role} onChange={handle}>
                <option value="volunteer">Volunteer</option>
                <option value="coordinator">Coordinator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" name="email"
              placeholder="you@org.com" value={form.email} onChange={handle} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" name="password"
              placeholder="Min 6 characters" value={form.password} onChange={handle} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-control" name="phone" placeholder="9XXXXXXXXX"
                value={form.phone} onChange={handle} />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-control" name="location" placeholder="City / District"
                value={form.location} onChange={handle} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Organization</label>
            <input className="form-control" name="organization" placeholder="NGO / Authority name"
              value={form.organization} onChange={handle} />
          </div>

          {form.role === 'volunteer' && (
            <div className="form-group">
              <label className="form-label">Skills</label>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:4 }}>
                {SKILLS.map(s => (
                  <button key={s} type="button"
                    onClick={() => toggleSkill(s)}
                    className={`btn btn-sm ${form.skills.includes(s) ? 'btn-primary' : 'btn-ghost'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary full-width mt-2" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account →'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
