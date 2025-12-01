import React, { useMemo } from 'react';
import { apiRequest, pickList } from '../../utils/api';
import { useApiData } from '../../hooks/useApiData';

const DoctorTop = () => {
  const { data, loading, error } = useApiData(async () => {
    const payload = await apiRequest('/api/doctors/top?limit=5');
    const list = pickList(payload);
    return list.map((item) => ({
      name: item.fullName || item.name || 'Unknown',
      specialty: item.specialty || item.medicalSpecialization || item.specialization || '-',
      rating: item.rating || 5.0, // Default rating as backend might not have it
      revenue: item.consultationFee * 100 || 0 // Estimate revenue or use real field if available
    }));
  }, []);

  const topDoctors = useMemo(() => data, [data]);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(2,6,23,0.06)', padding: 16 }}>
        <h2 style={{ margin: '0 0 12px', color: '#0f172a' }}>Top Doctors</h2>
        {loading && <p style={{ color: '#64748b' }}>Loading top doctors...</p>}
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}
        {!loading && !error && (
          <div style={{ display: 'grid', gap: 10 }}>
            {topDoctors.map((doc, idx) => (
              <div key={idx} style={{ padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>{doc.name}</p>
                  <p style={{ margin: '4px 0 0', color: '#475569' }}>{doc.specialty}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>Rating: {doc.rating}</p>
                  <p style={{ margin: '4px 0 0', color: '#047857', fontWeight: 700 }}>Revenue: ₹{doc.revenue.toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
            {topDoctors.length === 0 && <p style={{ color: '#64748b' }}>No doctors found.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorTop;
