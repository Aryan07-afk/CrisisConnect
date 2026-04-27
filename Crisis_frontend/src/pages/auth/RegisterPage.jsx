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
        await register(form);
        navigate('/app/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  if (applicationSubmitted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--brand)', marginBottom: '16px' }}>emergency</div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--t1)', letterSpacing: '-0.02em', marginBottom: '8px' }}>CrisisConnect</h1>
          <p style={{ fontSize: '14px', color: 'var(--t3)' }}>Coordinator Application</p>
        </div>

        <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '40px 32px', textAlign: 'center' }}>
          <div className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--success)', marginBottom: '16px' }}>check_circle</div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--t1)', marginBottom: '8px' }}>Application Submitted!</h2>
          <p style={{ color: 'var(--t3)', fontSize: '13px', lineHeight: 1.5, marginBottom: '24px' }}>
            Your coordinator application has been received. An admin will review your documents and credentials. You'll receive an email once your application is processed.
          </p>

          <div style={{ background: 'var(--neutral-bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '16px', marginBottom: '32px', textAlign: 'left' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--t4)', marginBottom: '4px', fontWeight: 600 }}>Estimated Review Time</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--t1)' }}>1–3 Business Days</div>
          </div>

          <Link to="/login" className="btn-primary" style={{ display: 'inline-flex', width: '100%', height: '44px', justifyContent: 'center', fontSize: '14px', fontWeight: 600 }}>
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg)' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--brand)', marginBottom: '16px' }}>emergency</div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--t1)', letterSpacing: '-0.02em', marginBottom: '8px' }}>Create an Account</h1>
        <p style={{ fontSize: '14px', color: 'var(--t3)' }}>Join the platform to help coordinate relief operations</p>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '32px' }}>
        {error && <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-br)', padding: '10px 14px', borderRadius: 'var(--r-md)', marginBottom: '20px', fontSize: '13px' }}>{error}</div>}

        <form onSubmit={submit}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--t2)', marginBottom: '8px' }}>Full Name</label>
              <input className="form-control" name="name" placeholder="John Doe" value={form.name} onChange={handle} required style={{ height: '40px' }} />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--t2)', marginBottom: '8px' }}>Role</label>
              <select className="form-control" name="role" value={form.role} onChange={handle} style={{ height: '40px' }}>
                <option value="volunteer">Volunteer</option>
                <option value="coordinator">Coordinator</option>
              </select>
            </div>
          </div>

          {form.role === 'coordinator' && (
            <div style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning-br)', borderRadius: 'var(--r-md)', padding: '12px 16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>assignment</span>
                Coordinator Application
              </div>
              <div style={{ fontSize: '12px', color: 'var(--t2)', lineHeight: 1.5 }}>
                Coordinator accounts require admin approval. You'll need to upload a valid document proof (government ID, organization letter, or certification). Your application will be reviewed within 1–3 business days.
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--t2)', marginBottom: '8px' }}>Email address</label>
            <input className="form-control" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handle} required style={{ height: '40px' }} />
          </div>
          
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--t2)', marginBottom: '8px' }}>Password</label>
            <input className="form-control" type="password" name="password" placeholder="Min 6 characters" value={form.password} onChange={handle} required style={{ height: '40px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--t2)', marginBottom: '8px' }}>Phone</label>
              <input className="form-control" name="phone" placeholder="9XXXXXXXXX" value={form.phone} onChange={handle} style={{ height: '40px' }} />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--t2)', marginBottom: '8px' }}>Location</label>
              <input className="form-control" name="location" placeholder="City / District" value={form.location} onChange={handle} style={{ height: '40px' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--t2)', marginBottom: '8px' }}>Organization</label>
            <input className="form-control" name="organization" placeholder="NGO / Authority name" value={form.organization} onChange={handle} style={{ height: '40px' }} />
          </div>

          {form.role === 'volunteer' && (
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--t2)', marginBottom: '8px' }}>Skills</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {SKILLS.map(s => (
                  <button key={s} type="button" onClick={() => toggleSkill(s)} className={form.skills.includes(s) ? 'btn-primary' : 'btn-ghost'} style={{ padding: '6px 14px', fontSize: '12px', borderRadius: 'var(--r-xl)', textTransform: 'capitalize' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {form.role === 'coordinator' && (
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--t2)', marginBottom: '8px' }}>
                Document Proof <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--r-md)', padding: '24px 16px', textAlign: 'center', cursor: 'pointer', background: documentFile ? 'var(--success-bg)' : 'transparent', borderColor: documentFile ? 'var(--success-br)' : 'var(--border)', transition: 'all 0.2s' }} onClick={() => document.getElementById('doc-upload').click()}>
                {documentFile ? (
                  <div>
                    <div className="material-symbols-outlined" style={{ fontSize: '28px', color: 'var(--success)', marginBottom: '8px' }}>task</div>
                    <div style={{ fontWeight: 600, color: 'var(--t1)', fontSize: '13px', marginBottom: '4px' }}>{documentFile.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--t4)' }}>{(documentFile.size / 1024 / 1024).toFixed(2)} MB — Click to change</div>
                  </div>
                ) : (
                  <div>
                    <div className="material-symbols-outlined" style={{ fontSize: '28px', color: 'var(--t4)', marginBottom: '8px' }}>upload_file</div>
                    <div style={{ fontWeight: 600, color: 'var(--t2)', fontSize: '13px', marginBottom: '4px' }}>Click or drag to upload document</div>
                    <div style={{ fontSize: '11px', color: 'var(--t4)' }}>PDF, JPG, or PNG — Max 5 MB</div>
                  </div>
                )}
                <input id="doc-upload" type="file" accept={ACCEPTED_FILE_TYPES} style={{ display: 'none' }} onChange={(e) => setDocumentFile(e.target.files[0] || null)} />
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', height: '44px', justifyContent: 'center', fontSize: '14px', fontWeight: 600 }}>
            {loading ? (form.role === 'coordinator' ? 'Submitting…' : 'Creating account…') : (form.role === 'coordinator' ? 'Submit Application' : 'Create account')}
          </button>
        </form>
      </div>

      <p style={{ marginTop: '32px', fontSize: '13px', color: 'var(--t3)' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
      </p>
    </div>
  );
}
