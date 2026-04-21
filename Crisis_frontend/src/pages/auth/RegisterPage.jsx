import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { coordinatorApplicationsAPI } from '../../api';

const SKILLS = ['medical','rescue','logistics','communication','general'];

const ACCEPTED_FILE_TYPES = '.pdf,.jpg,.jpeg,.png';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name:'', email:'', password:'', role:'volunteer',
    phone:'', organization:'', location:'', skills:[]
  });
  const [documentFile, setDocumentFile] = useState(null);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
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
      if (form.role === 'coordinator') {
        // Coordinator flow — submit application with document proof
        if (!documentFile) {
          setError('Please upload a document proof (PDF, JPG, or PNG) to apply as coordinator.');
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('email', form.email);
        formData.append('password', form.password);
        formData.append('phone', form.phone);
        formData.append('organization', form.organization);
        formData.append('location', form.location);
        formData.append('skills', JSON.stringify(form.skills));
        formData.append('documentProof', documentFile);

        await coordinatorApplicationsAPI.submit(formData);
        setApplicationSubmitted(true);
      } else {
        // Volunteer flow — register immediately
        await register(form);
        navigate('/app/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  // Show success state after coordinator application submitted
  if (applicationSubmitted) {
    return (
      <div className="auth-page">
        <div className="auth-grid-bg" />
        <div className="auth-glow" />
        <div className="auth-card" style={{ maxWidth: 480, textAlign: 'center' }}>
          <div className="auth-logo" style={{ justifyContent: 'center' }}>
            <div className="auth-logo-icon">🚨</div>
            <div>
              <div className="auth-logo-text">CrisisConnect</div>
              <div className="auth-logo-sub">Coordinator Application</div>
            </div>
          </div>

          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(34,197,94,0.12)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '24px auto 16px', fontSize: 36
          }}>
            ✅
          </div>
          <h2 className="auth-title" style={{ color: 'var(--green, #22c55e)' }}>
            Application Submitted!
          </h2>
          <p className="auth-sub" style={{ maxWidth: 360, margin: '0 auto 20px' }}>
            Your coordinator application has been received. An admin will review your documents and credentials. You'll receive an email once your application is processed.
          </p>

          <div style={{
            background: 'var(--card, #0e1420)',
            border: '1px solid var(--border, #1e2d47)',
            borderRadius: 10, padding: '16px 20px',
            margin: '0 auto 24px', maxWidth: 320, textAlign: 'left'
          }}>
            <div style={{ fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text3, #3d4f72)', marginBottom: 4 }}>
              Estimated Review Time
            </div>
            <div style={{ fontWeight: 700, color: 'var(--text1, #dce6f5)' }}>
              1–3 Business Days
            </div>
          </div>

          <Link to="/login" className="btn btn-primary" style={{ display: 'inline-block' }}>
            ← Back to Login
          </Link>
        </div>
      </div>
    );
  }

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
              <select className="form-control" name="role" value={form.role} onChange={handle} id="register-role-select">
                <option value="volunteer">Volunteer</option>
                <option value="coordinator">Coordinator</option>
              </select>
            </div>
          </div>

          {/* Coordinator info banner */}
          {form.role === 'coordinator' && (
            <div style={{
              background: 'rgba(249,115,22,0.08)',
              border: '1px solid rgba(249,115,22,0.25)',
              borderRadius: 8, padding: '12px 16px',
              marginBottom: 16, fontSize: '.85rem',
              color: 'var(--accent, #f97316)', lineHeight: 1.5
            }}>
              <strong>📋 Coordinator Application</strong>
              <div style={{ color: 'var(--text2, #7a8fb5)', marginTop: 4, fontSize: '.8rem' }}>
                Coordinator accounts require admin approval. You'll need to upload a valid document proof (government ID, organization letter, or certification). Your application will be reviewed within 1–3 business days.
              </div>
            </div>
          )}

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

          {/* Document proof upload for coordinator */}
          {form.role === 'coordinator' && (
            <div className="form-group">
              <label className="form-label">
                Document Proof <span style={{ color: 'var(--red, #ef4444)' }}>*</span>
              </label>
              <div style={{
                border: '2px dashed var(--border, #1e2d47)',
                borderRadius: 10, padding: '20px 16px',
                textAlign: 'center', cursor: 'pointer',
                transition: 'border-color 0.2s, background 0.2s',
                background: documentFile ? 'rgba(34,197,94,0.06)' : 'transparent',
                borderColor: documentFile ? 'rgba(34,197,94,0.4)' : 'var(--border, #1e2d47)',
              }}
                onClick={() => document.getElementById('doc-upload').click()}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent, #f97316)'; }}
                onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border, #1e2d47)'; }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = 'var(--border, #1e2d47)';
                  if (e.dataTransfer.files[0]) setDocumentFile(e.dataTransfer.files[0]);
                }}
              >
                {documentFile ? (
                  <div>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>📎</div>
                    <div style={{ fontWeight: 600, color: 'var(--text1, #dce6f5)', fontSize: '.9rem' }}>
                      {documentFile.name}
                    </div>
                    <div style={{ fontSize: '.75rem', color: 'var(--text3, #3d4f72)', marginTop: 2 }}>
                      {(documentFile.size / 1024 / 1024).toFixed(2)} MB — Click to change
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>📤</div>
                    <div style={{ fontWeight: 600, color: 'var(--text2, #7a8fb5)', fontSize: '.85rem' }}>
                      Click or drag to upload document
                    </div>
                    <div style={{ fontSize: '.75rem', color: 'var(--text3, #3d4f72)', marginTop: 4 }}>
                      PDF, JPG, or PNG — Max 5 MB
                    </div>
                  </div>
                )}
                <input
                  id="doc-upload"
                  type="file"
                  accept={ACCEPTED_FILE_TYPES}
                  style={{ display: 'none' }}
                  onChange={(e) => setDocumentFile(e.target.files[0] || null)}
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary full-width mt-2" disabled={loading}>
            {loading
              ? (form.role === 'coordinator' ? 'Submitting application…' : 'Creating account…')
              : (form.role === 'coordinator' ? 'Submit Application →' : 'Create account →')
            }
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
