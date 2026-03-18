import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usersAPI, authAPI } from '../../api';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/common/Badge';

const SKILLS = ['medical','rescue','logistics','communication','general'];

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name||'', phone: user?.phone||'',
    organization: user?.organization||'', location: user?.location||'',
    skills: user?.skills||[]
  });
  const [pwForm, setPwForm] = useState({ currentPassword:'', newPassword:'' });
  const [msg, setMsg]   = useState('');
  const [err, setErr]   = useState('');
  const [saving, setSaving] = useState(false);

  const handle = (e) => setForm(f=>({...f,[e.target.name]:e.target.value}));
  const handlePw = (e) => setPwForm(f=>({...f,[e.target.name]:e.target.value}));
  const toggleSkill = (s) => setForm(f=>({
    ...f, skills: f.skills.includes(s)?f.skills.filter(x=>x!==s):[...f.skills,s]
  }));

  const saveProfile = async (e) => {
    e.preventDefault(); setMsg(''); setErr(''); setSaving(true);
    try {
      await usersAPI.update(user._id, form);
      await refreshUser();
      setMsg('Profile updated successfully');
    } catch(er){ setErr(er.response?.data?.message||'Update failed'); }
    finally{ setSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault(); setMsg(''); setErr(''); setSaving(true);
    try {
      await authAPI.changePassword(pwForm);
      setMsg('Password changed successfully');
      setPwForm({ currentPassword:'', newPassword:'' });
    } catch(er){ setErr(er.response?.data?.message||'Password change failed'); }
    finally{ setSaving(false); }
  };

  return (
    <>
      <PageHeader title="My Profile" subtitle="Manage your account settings" />
      <div className="page-body page-enter">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Profile Information</div>
                <div className="card-subtitle">Update your details</div>
              </div>
            </div>
            {msg && <div className="alert alert-success">{msg}</div>}
            {err && <div className="alert alert-error">{err}</div>}
            <form onSubmit={saveProfile}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-control" name="name" value={form.name} onChange={handle} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-control" name="phone" value={form.phone} onChange={handle} />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input className="form-control" name="location" value={form.location} onChange={handle} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Organization</label>
                <input className="form-control" name="organization" value={form.organization} onChange={handle} />
              </div>
              {user?.role === 'volunteer' && (
                <div className="form-group">
                  <label className="form-label">Skills</label>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:4 }}>
                    {SKILLS.map(s => (
                      <button key={s} type="button" onClick={()=>toggleSkill(s)}
                        className={`btn btn-sm ${form.skills.includes(s)?'btn-primary':'btn-ghost'}`}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving…':'Save changes'}</button>
            </form>
          </div>

          <div>
            <div className="card mb-2" style={{ marginBottom:16 }}>
              <div className="card-header">
                <div className="card-title">Account Info</div>
              </div>
              <div className="detail-grid">
                <div className="detail-item"><div className="detail-lbl">Email</div><div className="detail-val">{user?.email}</div></div>
                <div className="detail-item"><div className="detail-lbl">Role</div><div className="detail-val"><Badge value={user?.role} /></div></div>
                <div className="detail-item"><div className="detail-lbl">Status</div><div className="detail-val" style={{color: user?.isActive?'var(--green)':'var(--red)'}}>
                  {user?.isActive ? '● Active' : '● Inactive'}</div></div>
                {user?.role==='volunteer' && (
                  <div className="detail-item"><div className="detail-lbl">Availability</div>
                    <div className="detail-val" style={{color: user?.isAvailable?'var(--green)':'var(--yellow)'}}>
                      {user?.isAvailable ? '● Available' : '● Busy'}</div></div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header"><div className="card-title">Change Password</div></div>
              <form onSubmit={changePassword}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input className="form-control" type="password" name="currentPassword" value={pwForm.currentPassword} onChange={handlePw} required />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input className="form-control" type="password" name="newPassword" value={pwForm.newPassword} onChange={handlePw} required />
                </div>
                <button type="submit" className="btn btn-ghost" disabled={saving}>{saving?'Updating…':'Update password'}</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
