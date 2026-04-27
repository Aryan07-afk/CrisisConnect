import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usersAPI, authAPI } from '../../api';

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

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div className="topbar">
        <div className="topbar-left">
          <h1>My Profile</h1>
          <p>Manage your account settings</p>
        </div>
      </div>
      
      <div className="page-body page-enter">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Profile Information</div>
              <div style={{ fontSize: '12px', color: 'var(--t4)', marginTop: '2px' }}>Update your details</div>
            </div>
            <div className="card-body">
              {msg && <div style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-br)', padding: '10px 14px', borderRadius: 'var(--r-md)', marginBottom: '16px', fontSize: '13px' }}>{msg}</div>}
              {err && <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-br)', padding: '10px 14px', borderRadius: 'var(--r-md)', marginBottom: '16px', fontSize: '13px' }}>{err}</div>}
              
              <form onSubmit={saveProfile}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--t2)', marginBottom: '6px' }}>Full Name</label>
                  <input className="form-control" name="name" value={form.name} onChange={handle} required />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--t2)', marginBottom: '6px' }}>Phone</label>
                    <input className="form-control" name="phone" value={form.phone} onChange={handle} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--t2)', marginBottom: '6px' }}>Location</label>
                    <input className="form-control" name="location" value={form.location} onChange={handle} />
                  </div>
                </div>
                
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--t2)', marginBottom: '6px' }}>Organization</label>
                  <input className="form-control" name="organization" value={form.organization} onChange={handle} />
                </div>
                
                {user?.role === 'volunteer' && (
                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label className="form-label" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--t2)', marginBottom: '6px' }}>Skills</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                      {SKILLS.map(s => (
                        <button key={s} type="button" onClick={() => toggleSkill(s)}
                          className={form.skills.includes(s) ? 'btn-primary' : 'btn-ghost'}
                          style={{ padding: '4px 12px', fontSize: '12px', borderRadius: 'var(--r-xl)', textTransform: 'capitalize' }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <button type="submit" className="btn-primary" disabled={saving} style={{ marginTop: '8px' }}>
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </form>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card">
              <div className="card-header">
                <div className="card-title">Account Info</div>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--t4)', marginBottom: '2px' }}>Email</div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--t1)' }}>{user?.email}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--t4)', marginBottom: '2px' }}>Role</div>
                    <div style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 'var(--r-xs)', fontSize: '11px', fontWeight: 600, background: 'var(--info-bg)', color: 'var(--info)', border: '1px solid var(--info-br)', textTransform: 'uppercase' }}>
                      {user?.role}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--t4)', marginBottom: '2px' }}>Status</div>
                    <div style={{ fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', color: user?.isActive ? 'var(--success)' : 'var(--danger)' }}>
                      <div className={`priority-dot ${user?.isActive ? 'low' : 'critical'}`} style={{ width: '8px', height: '8px' }} />
                      {user?.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  {user?.role === 'volunteer' && (
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--t4)', marginBottom: '2px' }}>Availability</div>
                      <div style={{ fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', color: user?.isAvailable ? 'var(--success)' : 'var(--warning)' }}>
                        <div className={`priority-dot ${user?.isAvailable ? 'low' : 'medium'}`} style={{ width: '8px', height: '8px' }} />
                        {user?.isAvailable ? 'Available' : 'Busy'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Change Password</div>
              </div>
              <div className="card-body">
                <form onSubmit={changePassword}>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--t2)', marginBottom: '6px' }}>Current Password</label>
                    <input className="form-control" type="password" name="currentPassword" value={pwForm.currentPassword} onChange={handlePw} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label className="form-label" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--t2)', marginBottom: '6px' }}>New Password</label>
                    <input className="form-control" type="password" name="newPassword" value={pwForm.newPassword} onChange={handlePw} required />
                  </div>
                  <button type="submit" className="btn-ghost" disabled={saving}>
                    {saving ? 'Updating…' : 'Update password'}
                  </button>
                </form>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}
