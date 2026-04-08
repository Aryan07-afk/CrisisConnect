import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usersAPI, authAPI } from '../../api';
import PageHeader from '../../components/layout/PageHeader';

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
      <PageHeader title="My Profile" subtitle="Manage your account details" />
      <div className="page-body page-enter">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card">
            <div className="card-header"><div className="card-title">Personal Information</div></div>
            {msg && <div className="alert alert-success">{msg}</div>}
            {err && <div className="alert alert-error">{err}</div>}
            <form onSubmit={saveProfile}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-control" name="name" value={form.name} onChange={handle} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" name="phone" value={form.phone} onChange={handle} />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input className="form-control" name="address" value={form.address} onChange={handle} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">District</label>
                  <input className="form-control" name="district" value={form.district} onChange={handle} />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input className="form-control" name="state" value={form.state} onChange={handle} />
                </div>
              </div>
              <button type="submit" className="btn" disabled={saving}
                style={{ background: 'var(--red)', color: '#fff' }}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </form>
          </div>

          <div>
            <div className="card mb-2" style={{ marginBottom: 16 }}>
              <div className="card-header"><div className="card-title">Account Info</div></div>
              <div className="detail-grid">
                <div className="detail-item"><div className="detail-lbl">Email</div><div className="detail-val">{user?.email}</div></div>
                <div className="detail-item"><div className="detail-lbl">Role</div>
                  <div className="detail-val">
                    <span className="badge-pill" style={{ background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid rgba(244,63,94,.25)' }}>
                      🆘 Victim
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><div className="card-title">Change Password</div></div>
              <form onSubmit={changePassword}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input className="form-control" type="password" name="currentPassword"
                    value={pwForm.currentPassword} onChange={handlePw} required />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input className="form-control" type="password" name="newPassword"
                    value={pwForm.newPassword} onChange={handlePw} required />
                </div>
                <button type="submit" className="btn btn-ghost" disabled={saving}>
                  {saving ? 'Updating…' : 'Update password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
