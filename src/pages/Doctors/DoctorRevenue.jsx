import React, { useMemo } from 'react';
import { apiRequest, pickList } from '../../utils/api';
import { useApiData } from '../../hooks/useApiData';

const DoctorRevenue = () => {
  const { data, loading, error } = useApiData(async () => {
    const payload = await apiRequest('/api/doctors/top?limit=100');
    const list = pickList(payload);
    return list.map((item) => ({
      name: item.fullName || item.name || 'Unknown',
      specialty: item.specialty || item.medicalSpecialization || item.specialization || '-',
      revenue: (item.consultationFee || 0) * (item.experienceYears || 1) * 50, // Simulated total revenue
      sessions: (item.experienceYears || 1) * 50 // Simulated sessions
    }));
  }, []);

  const doctorRevenue = useMemo(() => data.slice(0, 5), [data]);

  const summary = useMemo(() => {
    const totalRevenue = data.reduce((acc, curr) => acc + curr.revenue, 0);
    const avgRevenue = data.length ? totalRevenue / data.length : 0;
    return [
      { label: 'Monthly Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}` },
      { label: 'Avg per Doctor', value: `₹${Math.round(avgRevenue).toLocaleString('en-IN')}` },
      { label: 'MoM Growth', value: '+12%' }, // Static for now
    ];
  }, [data]);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(2,6,23,0.06)', padding: 16, display: 'grid', gap: 14 }}>
        <div>
          <h2 style={{ margin: '0 0 8px', color: '#0f172a' }}>Doctors Revenue</h2>
          <p style={{ margin: '0 0 8px', color: '#475569' }}>High-level revenue snapshots for doctors.</p>
        </div>

        {loading && <p style={{ color: '#64748b' }}>Loading revenue data...</p>}
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}

        {!loading && !error && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              {summary.map((card) => (
                <div key={card.label} style={{ padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#475569', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{card.label}</p>
                  <p style={{ margin: '6px 0 0', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{card.value}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 4 }}>
              <p style={{ margin: '0 0 8px', fontWeight: 700, color: '#0f172a' }}>Revenue by Doctor</p>
              <div style={{ display: 'grid', gap: 10 }}>
                {doctorRevenue.map((item, idx) => (
                  <div key={idx} style={{ padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>{item.name}</p>
                      <p style={{ margin: '4px 0 0', color: '#475569' }}>{item.specialty}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, fontWeight: 700, color: '#047857' }}>₹{item.revenue.toLocaleString('en-IN')}</p>
                      <p style={{ margin: '4px 0 0', color: '#475569', fontSize: 12 }}>Sessions: {item.sessions}</p>
                    </div>
                  </div>
                ))}
                {doctorRevenue.length === 0 && <p style={{ color: '#64748b' }}>No revenue data available.</p>}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorRevenue;
