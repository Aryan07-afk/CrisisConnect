import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { victimAPI } from '../../api';
import PageHeader from '../../components/layout/PageHeader';
import MapPicker from '../../components/common/MapPicker';

const NEED_TYPES = ['food','water','shelter','medical','rescue','clothing','other'];
const URGENCIES  = ['critical','high','medium','low'];

const URGENCY_DESC = {
  critical: '🔴 Life-threatening — immediate help needed',
  high:     '🟠 Serious — help needed within hours',
  medium:   '🟡 Important — help needed within a day',
  low:      '🟢 Can wait — not immediately life-threatening',
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
      <PageHeader title="SOS Submitted" />
      <div className="page-body page-enter">
        <div className="card" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.2rem', marginBottom: 8 }}>Request Submitted Successfully</h2>
          <p style={{ color: 'var(--text2)', fontSize: '.9rem', marginBottom: 20 }}>
            Your SOS request has been received. Our team will review it and assign help shortly.
          </p>
          <div style={{ fontSize: '.78rem', color: 'var(--text3)' }}>Redirecting to your requests…</div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <PageHeader title="Submit SOS Request" subtitle="Tell us what you need — we'll get help to you" />
      <div className="page-body page-enter">

        <div style={{
          background: 'var(--red-bg)', border: '1px solid rgba(244,63,94,.3)',
          borderRadius: 'var(--r)', padding: '12px 16px', marginBottom: 20,
          fontSize: '.85rem', color: 'var(--red)'
        }}>
          ⚠️ For life-threatening emergencies, call <strong>112</strong> first. Use this form for relief resource requests.
        </div>

        <div className="card" style={{ maxWidth: 640 }}>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={submit}>

            {/* Need Type */}
            <div className="form-group">
              <label className="form-label">What do you need? *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                {NEED_TYPES.map(t => (
                  <button key={t} type="button"
                    onClick={() => setForm(f => ({ ...f, needType: t }))}
                    className={`btn btn-sm ${form.needType === t ? 'btn-danger' : 'btn-ghost'}`}
                    style={form.needType === t ? { background: 'var(--red)', color: '#fff' } : {}}>
                    {t === 'food' ? '🍲' : t === 'water' ? '💧' : t === 'shelter' ? '🏠' :
                     t === 'medical' ? '🏥' : t === 'rescue' ? '🚁' : t === 'clothing' ? '👕' : '📦'}
                    {' '}{t}
                  </button>
                ))}
              </div>
            </div>

            {/* Urgency */}
            <div className="form-group">
              <label className="form-label">How urgent is this? *</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
                {URGENCIES.map(u => (
                  <label key={u} style={{
                    display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                    background: form.urgency === u ? 'var(--bg4)' : 'var(--bg3)',
                    border: `1px solid ${form.urgency === u ? 'var(--border2)' : 'var(--border)'}`,
                    borderRadius: 'var(--r)', padding: '10px 14px',
                    transition: 'all .15s'
                  }}>
                    <input type="radio" name="urgency" value={u}
                      checked={form.urgency === u}
                      onChange={handle}
                      style={{ accentColor: 'var(--red)' }} />
                    <span style={{ fontSize: '.88rem' }}>{URGENCY_DESC[u]}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Describe your situation *</label>
              <textarea className="form-control" name="description" value={form.description}
                onChange={handle} required
                placeholder="Describe your current situation in as much detail as possible — how many people need help, what exactly is needed, any medical conditions, etc."
                style={{ minHeight: 110 }} />
            </div>

            {/* People count */}
            <div className="form-group">
              <label className="form-label">How many people need help? *</label>
              <input className="form-control" type="number" name="peopleCount"
                value={form.peopleCount} onChange={handle} min={1} style={{ maxWidth: 140 }} />
            </div>

            <div className="divider" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: '.72rem', color: 'var(--text3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                Your Location (where to send help)
              </div>
              <button type="button" className="btn btn-ghost btn-xs"
                onClick={() => setShowMap(m => !m)}>
                {showMap ? '✕ Hide Map' : '🗺️ Pick on Map'}
              </button>
            </div>

            {showMap && (
              <MapPicker
                onLocationSelect={handleMapSelect}
                initialLat={coords?.lat}
                initialLng={coords?.lng}
              />
            )}

            <div className="form-group">
              <label className="form-label">Address / Area *</label>
              <input className="form-control" name="location.address" value={form['location.address']}
                onChange={handle} placeholder="House / Street / Village" required />
            </div>

            <div className="form-group">
              <label className="form-label">Nearest Landmark</label>
              <input className="form-control" name="location.landmark" value={form['location.landmark']}
                onChange={handle} placeholder="Near school, temple, highway, etc." />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Area / Block</label>
                <input className="form-control" name="location.area" value={form['location.area']} onChange={handle} />
              </div>
              <div className="form-group">
                <label className="form-label">District</label>
                <input className="form-control" name="location.district" value={form['location.district']} onChange={handle} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">State</label>
              <input className="form-control" name="location.state" value={form['location.state']} onChange={handle} style={{ maxWidth: 200 }} />
            </div>

            <button type="submit" className="btn full-width mt-2" disabled={saving}
              style={{ background: 'var(--red)', color: '#fff', justifyContent: 'center', padding: '12px' }}>
              {saving ? 'Submitting…' : '🆘 Submit SOS Request'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
