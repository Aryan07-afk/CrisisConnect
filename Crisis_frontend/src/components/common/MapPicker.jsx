import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';

// Dynamically load leaflet to avoid SSR issues
let L = null;

export default function MapPicker({ onLocationSelect, initialLat, initialLng }) {
  const mapRef     = useRef(null);
  const mapInstance= useRef(null);
  const markerRef  = useRef(null);
  const [loading, setLoading]   = useState(true);
  const [address, setAddress]   = useState('');
  const [coords, setCoords]     = useState(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );

  useEffect(() => {
    // Dynamically import leaflet
    import('leaflet').then(leaflet => {
      L = leaflet.default;

      // Fix default marker icon path issue with vite
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (mapInstance.current) return; // already initialized

      // Default center: India
      const defaultLat = initialLat || 20.5937;
      const defaultLng = initialLng || 78.9629;
      const defaultZoom = initialLat ? 14 : 5;

      const map = L.map(mapRef.current).setView([defaultLat, defaultLng], defaultZoom);

      // OpenStreetMap tiles — free, no API key
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // If initial coords provided, place marker
      if (initialLat && initialLng) {
        markerRef.current = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);
        setupMarkerDrag(markerRef.current);
      }

      // Click to place / move marker
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        placeMarker(map, lat, lng);
      });

      mapInstance.current = map;
      setLoading(false);
      // Force map to recalculate size after DOM is ready
      setTimeout(() => map.invalidateSize(), 100);
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  const setupMarkerDrag = (marker) => {
    marker.on('dragend', () => {
      const { lat, lng } = marker.getLatLng();
      reverseGeocode(lat, lng);
    });
  };

  const placeMarker = (map, lat, lng) => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
      setupMarkerDrag(markerRef.current);
    }
    reverseGeocode(lat, lng);
  };

  const reverseGeocode = async (lat, lng) => {
    setCoords({ lat: lat.toFixed(6), lng: lng.toFixed(6) });
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      const addr = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setAddress(addr);

      // Parse address components
      const a = data.address || {};
      onLocationSelect({
        address:  addr,
        area:     a.suburb || a.village || a.town || a.county || '',
        district: a.district || a.city || a.state_district || '',
        state:    a.state || '',
        pincode:  a.postcode || '',
        landmark: a.road || a.neighbourhood || '',
        coordinates: { lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) },
      });
    } catch {
      const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setAddress(fallback);
      onLocationSelect({
        address: fallback,
        coordinates: { lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) },
      });
    }
  };

  const locateMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords: c }) => {
        mapInstance.current?.setView([c.latitude, c.longitude], 15);
        placeMarker(mapInstance.current, c.latitude, c.longitude);
      },
      () => alert('Could not get your location. Please allow location access.')
    );
  };

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 8
      }}>
        <label className="form-label" style={{ margin: 0 }}>
          📍 Pick Location on Map
        </label>
        <button type="button" className="btn btn-ghost btn-xs" onClick={locateMe}>
          🎯 Use My Location
        </button>
      </div>

      {/* Map container */}
      <div style={{
        position: 'relative',
        borderRadius: 'var(--r2)',
        overflow: 'hidden',
        border: '1px solid var(--border)',
      }}>
        {loading && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 10,
            background: 'var(--bg3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '.85rem', color: 'var(--text3)'
          }}>
            Loading map…
          </div>
        )}
        <div ref={mapRef} style={{ height: 300, width: '100%' }} />
      </div>

      {/* Hint */}
      <div style={{
        fontSize: '.72rem', color: 'var(--text3)',
        fontFamily: 'var(--font-mono)', marginTop: 6
      }}>
        Click on the map to drop a pin · Drag the pin to adjust · Or use "Use My Location"
      </div>

      {/* Selected address */}
      {address && (
        <div style={{
          marginTop: 8, background: 'var(--bg3)',
          border: '1px solid var(--border2)',
          borderRadius: 'var(--r)', padding: '8px 12px',
          fontSize: '.82rem', color: 'var(--text2)',
          display: 'flex', alignItems: 'flex-start', gap: 8
        }}>
          <span style={{ color: 'var(--accent)', flexShrink: 0 }}>📍</span>
          <span>{address}</span>
        </div>
      )}

      {/* Coordinates */}
      {coords && (
        <div style={{
          fontSize: '.68rem', color: 'var(--text3)',
          fontFamily: 'var(--font-mono)', marginTop: 4
        }}>
          Lat: {coords.lat} · Lng: {coords.lng}
        </div>
      )}
    </div>
  );
}
