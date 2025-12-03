import React, { useMemo } from 'react';
import { Star, TrendingUp } from 'lucide-react';
import { apiRequest, pickList } from '../../utils/api';
import { useApiData } from '../../hooks/useApiData';
import './doctors-page.css';

const DoctorTop = () => {
  const { data, loading, error } = useApiData(async () => {
    const payload = await apiRequest('/api/doctors/top?limit=5');
    const list = pickList(payload);
    return list.map((item) => ({
      name: item.doctorName || item.fullName || item.name || 'Unknown',
      specialty: item.specialty || item.medicalSpecialization || item.specialization || '-',
      rating: item.rating || 5.0,
      revenue: item.consultationFee * 100 || 0
    }));
  }, []);

  const topDoctors = useMemo(() => data, [data]);

  return (
    <div className="doctors-page">
      <div className="page-header">
        <h1 className="page-title">Top Performing Doctors</h1>
        <p className="page-subtitle">Highest rated and top revenue generating doctors.</p>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-state">Loading top doctors...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <table className="doctors-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Rating</th>
                <th style={{ textAlign: 'right' }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topDoctors.length === 0 ? (
                <tr>
                  <td colSpan="3" className="empty-state">No data available.</td>
                </tr>
              ) : (
                topDoctors.map((doc, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="doctor-cell">
                        <div className="doctor-avatar">
                          {doc.name.charAt(0)}
                        </div>
                        <div className="doctor-info">
                          <span className="doctor-name">{doc.name}</span>
                          <span className="doctor-email">{doc.specialty}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star size={14} fill="#fbbf24" color="#fbbf24" />
                        <span style={{ fontWeight: 600 }}>{doc.rating}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, color: '#059669', fontWeight: 600 }}>
                        <TrendingUp size={14} />
                        ₹{doc.revenue.toLocaleString('en-IN')}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DoctorTop;
