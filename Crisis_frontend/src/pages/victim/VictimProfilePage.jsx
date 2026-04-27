import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usersAPI, authAPI } from '../../api';

export default function VictimProfilePage() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name:     user?.name     || '',
    phone:    user?.phone    || '',
    address:  user?.address  || '',
    district: user?.district || '',
    state:    user?.state    || '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [msg, setMsg]   = useState('');
  const [err, setErr]   = useState('');
  const [saving, setSaving] = useState(false);

  const handle   = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handlePw = e => setPwForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const saveProfile = async e => {
    e.preventDefault(); setMsg(''); setErr(''); setSaving(true);
    try {
      await usersAPI.update(user._id, form);
      await refreshUser();
      setMsg('Profile updated successfully');
    } catch (er) { setErr(er.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const changePassword = async e => {
    e.preventDefault(); setMsg(''); setErr(''); setSaving(true);
    try {
      await authAPI.changePassword(pwForm);
      setMsg('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (er) { setErr(er.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>My Profile</h1>
          <p>Manage your account details</p>
        </div>
      </div>
      
      <div className="page-body page-enter">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          
          <div className="card">
            <div className="card-header">
              <div className="card-title">Personal Information</div>
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
                
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--t2)', marginBottom: '6px' }}>Phone</label>
                  <input className="form-control" name="phone" value={form.phone} onChange={handle} />
                </div>
                
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--t2)', marginBottom: '6px' }}>Address</label>
                  <input className="form-control" name="address" value={form.address} onChange={handle} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--t2)', marginBottom: '6px' }}>District</label>
                    <input className="form-control" name="district" value={form.district} onChange={handle} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--t2)', marginBottom: '6px' }}>State</label>
                    <input className="form-control" name="state" value={form.state} onChange={handle} />
                  </div>
                </div>
                
                <button type="submit" className="btn-primary" disabled={saving} style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }}>
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
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: 'var(--r-xs)', fontSize: '11px', fontWeight: 600, background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-br)', textTransform: 'uppercase' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>sos</span>
                      Victim
                    </div>
                  </div>
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
