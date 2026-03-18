import { useState } from 'react';
import { requestsAPI } from '../../api';
import MapPicker from '../../components/common/MapPicker';

const TYPES     = ['food','water','shelter','medical','rescue','clothing','other'];
const PRIORITIES= ['low','medium','high','critical'];
const STATUSES  = ['pending','assigned','in_progress','resolved','cancelled'];

export default function RequestForm({ initial, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    title:       initial?.title       || '',
    description: initial?.description || '',
    requestType: initial?.requestType || 'food',
    priority:    initial?.priority    || 'medium',
    status:      initial?.status      || 'pending',
    affectedCount: initial?.affectedCount || 1,
    'location.address':  initial?.location?.address  || '',
    'location.area':     initial?.location?.area     || '',
    'location.district': initial?.location?.district || '',
    'location.state':    initial?.location?.state    || '',
    'location.pincode':  initial?.location?.pincode  || '',
  });
  const [coords, setCoords] = useState(
    initial?.location?.coordinates || null
  );
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleMapSelect = (loc) => {
    setForm(f => ({
      ...f,
      'location.address':  loc.address  || f['location.address'],
      'location.area':     loc.area     || f['location.area'],
      'location.district': loc.district || f['location.district'],
      'location.state':    loc.state    || f['location.state'],
      'location.pincode':  loc.pincode  || f['location.pincode'],
    }));
    if (loc.coordinates) setCoords(loc.coordinates);
  };

  const submit = async e => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const payload = {
        title:        form.title,
        description:  form.description,
        requestType:  form.requestType,
        priority:     form.priority,
        affectedCount:Number(form.affectedCount),
        location: {
          address:  form['location.address'],
          area:     form['location.area'],
          district: form['location.district'],
          state:    form['location.state'],
          pincode:  form['location.pincode'],
          coordinates: coords || undefined,
        },
      };
      if (initial) {
        payload.status = form.status;
        await requestsAPI.update(initial._id, payload);
      } else {
        await requestsAPI.create(payload);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit}>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label className="form-label">Title *</label>
        <input className="form-control" name="title" value={form.title} onChange={handle}
          placeholder="Brief description of need" required />
      </div>

      <div className="form-group">
        <label className="form-label">Description *</label>
        <textarea className="form-control" name="description" value={form.description}
          onChange={handle} placeholder="Detailed situation description…" required />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Type *</label>
          <select className="form-control" name="requestType" value={form.requestType} onChange={handle}>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Priority</label>
          <select className="form-control" name="priority" value={form.priority} onChange={handle}>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {initial && (
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-control" name="status" value={form.status} onChange={handle}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">People Affected</label>
        <input className="form-control" type="number" name="affectedCount"
          value={form.affectedCount} onChange={handle} min={1} />
      </div>

      <div className="divider" />

      {/* Map toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: '.75rem', color: 'var(--text3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
          Location
        </div>
        <button type="button" className="btn btn-ghost btn-xs"
          onClick={() => setShowMap(m => !m)}>
          {showMap ? '✕ Hide Map' : '🗺️ Pick on Map'}
        </button>
      </div>

      {/* Map picker */}
      {showMap && (
        <MapPicker
          onLocationSelect={handleMapSelect}
          initialLat={coords?.lat}
          initialLng={coords?.lng}
        />
      )}

      <div className="form-group">
        <label className="form-label">Address *</label>
        <input className="form-control" name="location.address" value={form['location.address']}
          onChange={handle} placeholder="Street / Village / Landmark" required />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Area</label>
          <input className="form-control" name="location.area" value={form['location.area']} onChange={handle} placeholder="Block / Area" />
        </div>
        <div className="form-group">
          <label className="form-label">District</label>
          <input className="form-control" name="location.district" value={form['location.district']} onChange={handle} placeholder="District" />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">State</label>
          <input className="form-control" name="location.state" value={form['location.state']} onChange={handle} placeholder="State" />
        </div>
        <div className="form-group">
          <label className="form-label">Pincode</label>
          <input className="form-control" name="location.pincode" value={form['location.pincode']} onChange={handle} placeholder="000000" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : initial ? 'Update Request' : 'Create Request'}
        </button>
      </div>
    </form>
  );
}
