import React, { useMemo } from 'react';
import { apiRequest, pickList } from '../../utils/api';
import { useApiData } from '../../hooks/useApiData';

const DoctorTodayBooked = () => {
  const { data, loading, error } = useApiData(async () => {
    const payload = await apiRequest('/api/admin/appointments?range=today&limit=5');
    const list = pickList(payload);
    return list.map((item) => ({
      id: item._id,
      doctor: item.doctorName || item.doctor?.name || 'Unknown Doctor',
      patient: item.patientName || item.patient?.userName || 'Unknown Patient',
      time: new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: item.status.charAt(0).toUpperCase() + item.status.slice(1)
    }));
  }, []);

  const bookings = useMemo(() => data, [data]);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(2,6,23,0.06)', padding: 16 }}>
        <h2 style={{ margin: '0 0 12px', color: '#0f172a' }}>Today's Booked Doctors</h2>
        {loading && <p style={{ color: '#64748b' }}>Loading bookings...</p>}
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}
        {!loading && !error && (
          <div style={{ display: 'grid', gap: 10 }}>
            {bookings.map((item) => (
              <div key={item.id} style={{ padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>{item.doctor}</p>
                  <p style={{ margin: '4px 0 0', color: '#475569' }}>{item.patient} • {item.time}</p>
                </div>
                <span style={{ alignSelf: 'center', color: '#0f172a', fontWeight: 700 }}>{item.status}</span>
              </div>
            ))}
            {bookings.length === 0 && <p style={{ color: '#64748b' }}>No bookings for today.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorTodayBooked;
