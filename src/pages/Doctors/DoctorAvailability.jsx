import React, { useMemo } from 'react';
import { apiRequest, pickList } from '../../utils/api';
import { useApiData } from '../../hooks/useApiData';

const DoctorAvailability = () => {
  const { data, loading, error } = useApiData(async () => {
    const payload = await apiRequest('/api/admin/doctors/availability?limit=5');
    const list = pickList(payload);
    return list; // The API returns the exact format we need
  }, []);

  const availability = useMemo(() => data, [data]);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(2,6,23,0.06)', padding: 16 }}>
        <h2 style={{ margin: '0 0 12px', color: '#0f172a' }}>Doctor Availability</h2>
        <p style={{ margin: '0 0 12px', color: '#475569' }}>Upcoming availability by doctor.</p>

        {loading && <p style={{ color: '#64748b' }}>Loading availability...</p>}
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}

        {!loading && !error && (
          <div style={{ display: 'grid', gap: 10 }}>
            {availability.map((slot, idx) => (
              <div key={idx} style={{ padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <p style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>{slot.doctor} — {slot.specialty}</p>
                <p style={{ margin: '4px 0 0', color: '#475569' }}>{slot.days} • {slot.time}</p>
                <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: 13 }}>Location: {slot.location}</p>
              </div>
            ))}
            {availability.length === 0 && <p style={{ color: '#64748b' }}>No availability data found.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAvailability;
