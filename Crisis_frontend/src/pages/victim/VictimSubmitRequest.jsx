import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { victimAPI } from '../../api';
import MapPicker from '../../components/common/MapPicker';

const NEED_TYPES = ['food','water','shelter','medical','rescue','clothing','other'];
const URGENCIES  = ['critical','high','medium','low'];

const URGENCY_DESC = {
  critical: 'Life-threatening — immediate help needed',
  high:     'Serious — help needed within hours',
  medium:   'Important — help needed within a day',
  low:      'Can wait — not immediately life-threatening',
};

const ICONS = {
  food: 'restaurant', water: 'water_drop', shelter: 'home',
  medical: 'local_hospital', rescue: 'flight_takeoff', clothing: 'checkroom', other: 'inventory_2'
};

export default function VictimSubmitRequest() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    needType: 'food', description: '', urgency: 'high', peopleCount: 1,
    'location.address': '', 'location.area': '',
    'location.district': '', 'location.state': '', 'location.landmark': '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [coords, setCoords]   = useState(null);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => setCoords({ lat: position.coords.latitude, lng: position.coords.longitude }),
        (err) => console.log('Geolocation error:', err),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const handleMapSelect = (loc) => {
    setForm(f => ({
      ...f,
      'location.address':  loc.address  || f['location.address'],
      'location.area':     loc.area     || f['location.area'],
      'location.district': loc.district || f['location.district'],
      'location.state':    loc.state    || f['location.state'],
      'location.landmark': loc.landmark || f['location.landmark'],
    }));
    if (loc.coordinates) setCoords(loc.coordinates);
  };

  const submit = async e => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await victimAPI.submitRequest({
        needType:     form.needType,
        description:  form.description,
        urgency:      form.urgency,
        peopleCount:  Number(form.peopleCount),
        location: {
          address:  form['location.address'],
          area:     form['location.area'],
          district: form['location.district'],
          state:    form['location.state'],
          landmark: form['location.landmark'],
          coordinates: coords || undefined,
        },
      });
      setSuccess(true);
      setTimeout(() => navigate('/victim/requests'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally { setSaving(false); }
  };

  if (success) return (
    <>
      <div className="topbar"><div className="topbar-left"><h1>SOS Submitted</h1></div></div>
      <div className="page-body page-enter">
        <div className="card" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', padding: '40px' }}>
          <div className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--success)', marginBottom: '16px' }}>check_circle</div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--t1)', marginBottom: '8px' }}>Request Submitted Successfully</h2>
          <p style={{ color: 'var(--t3)', fontSize: '14px', marginBottom: '20px', lineHeight: 1.5 }}>
            Your SOS request has been received. Our team will review it and assign help shortly.
          </p>
          <div style={{ fontSize: '12px', color: 'var(--t4)' }}>Redirecting to your requests…</div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>Submit SOS Request</h1>
          <p>Tell us what you need — we'll get help to you</p>
        </div>
      </div>
      
      <div className="page-body page-enter">
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          
          <div className="alert-banner" style={{ marginBottom: '24px' }}>
            <span className="material-symbols-outlined">warning</span>
            <p><strong>Emergency:</strong> For life-threatening emergencies, call 112 first. Use this form for relief resource requests.</p>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Help Request Details</div>
            </div>
            <div className="card-body">
              {error && <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 'var(--r-md)', marginBottom: '20px', fontSize: '13px' }}>{error}</div>}
              
              <form onSubmit={submit}>
                
                {/* Need Type Grid */}
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label">What do you need? *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px', marginTop: '8px' }}>
                    {NEED_TYPES.map(t => (
                      <div key={t}
                        onClick={() => setForm(f => ({ ...f, needType: t }))}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '16px', borderRadius: 'var(--r-md)', border: `1px solid ${form.needType === t ? 'var(--brand)' : 'var(--border)'}`, background: form.needType === t ? 'var(--brand-bg)' : 'var(--neutral-bg)', cursor: 'pointer', transition: 'all 150ms ease' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '24px', color: form.needType === t ? 'var(--brand)' : 'var(--t4)' }}>{ICONS[t] || 'inventory_2'}</span>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: form.needType === t ? 'var(--brand)' : 'var(--t2)', textTransform: 'capitalize' }}>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Urgency */}
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label">How urgent is this? *</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    {URGENCIES.map(u => (
                      <label key={u} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', background: form.urgency === u ? 'var(--bg2)' : '#fff', border: `1px solid ${form.urgency === u ? 'var(--border)' : 'var(--border)'}`, borderRadius: 'var(--r-md)', padding: '12px 16px', transition: 'all 150ms ease' }}>
                        <input type="radio" name="urgency" value={u} checked={form.urgency === u} onChange={handle} style={{ margin: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t1)', textTransform: 'capitalize' }}>{u}</div>
                          <div style={{ fontSize: '12px', color: 'var(--t4)' }}>{URGENCY_DESC[u]}</div>
                        </div>
                        <div className={`priority-dot ${u}`} style={{ width: '10px', height: '10px' }} />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label">Describe your situation *</label>
                  <textarea className="form-control" name="description" value={form.description} onChange={handle} required placeholder="Describe your current situation in as much detail as possible — how many people need help, what exactly is needed, any medical conditions, etc." style={{ minHeight: '120px' }} />
                </div>

                {/* People Count */}
                <div className="form-group" style={{ marginBottom: '32px' }}>
                  <label className="form-label">How many people need help? *</label>
                  <input className="form-control" type="number" name="peopleCount" value={form.peopleCount} onChange={handle} min={1} style={{ maxWidth: '140px' }} />
                </div>

                <div style={{ height: '1px', background: 'var(--border)', margin: '0 -20px 24px -20px' }} />
                
                {/* Location Section */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t1)' }}>Location Details</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" className="btn-ghost" style={{ padding: '4px 10px', fontSize: '11px' }}
                      onClick={() => {
                        if ('geolocation' in navigator) {
                          navigator.geolocation.getCurrentPosition(
                            (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                            () => alert('Could not get your location. Please check your browser permissions.'),
                            { enableHighAccuracy: true }
                          );
                        }
                      }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>my_location</span> Detect GPS
                    </button>
                    <button type="button" className="btn-ghost" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => setShowMap(m => !m)}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>map</span> {showMap ? 'Hide Map' : 'Pick on Map'}
                    </button>
                  </div>
                </div>

                {showMap && (
                  <div style={{ marginBottom: '24px', borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <MapPicker onLocationSelect={handleMapSelect} initialLat={coords?.lat} initialLng={coords?.lng} />
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Address / Area *</label>
                  <input className="form-control" name="location.address" value={form['location.address']} onChange={handle} placeholder="House / Street / Village" required />
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Nearest Landmark</label>
                  <input className="form-control" name="location.landmark" value={form['location.landmark']} onChange={handle} placeholder="Near school, temple, highway, etc." />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Area / Block</label>
                    <input className="form-control" name="location.area" value={form['location.area']} onChange={handle} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">District</label>
                    <input className="form-control" name="location.district" value={form['location.district']} onChange={handle} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '32px' }}>
                  <label className="form-label">State</label>
                  <input className="form-control" name="location.state" value={form['location.state']} onChange={handle} />
                </div>

                <button type="submit" className="btn-primary" disabled={saving} style={{ width: '100%', height: '46px', fontSize: '14px', fontWeight: 600, justifyContent: 'center' }}>
                  {saving ? 'Submitting…' : 'Submit SOS Request'}
                </button>
              </form>
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}
