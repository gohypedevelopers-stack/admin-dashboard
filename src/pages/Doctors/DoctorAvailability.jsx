import React, { useMemo } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { apiRequest, pickList } from '../../utils/api';
import { useApiData } from '../../hooks/useApiData';
import './doctors-page.css';

const DoctorAvailability = () => {
  const { data, loading, error } = useApiData(async () => {
    const today = new Date().toISOString().split('T')[0];
    const payload = await apiRequest(`/api/appointments/doctors/available?date=${today}`);
    console.log('Availability Payload:', payload);
    // The API returns { data: { doctors: [...] } }
    const list = payload?.data?.doctors || [];
    return list.map(item => ({
      doctor: item.doctor?.name || 'Unknown Doctor',
      specialty: item.doctor?.specialization || '-',
      days: 'Today',
      time: `${item.availableSlots} slots`,
      location: item.doctor?.city || '-',
      raw: item
    }));
  }, []);

  const [selectedDoctor, setSelectedDoctor] = React.useState(null);

  const availability = useMemo(() => data, [data]);

  return (
    <div className="doctors-page">
      <div className="page-header">
        <h1 className="page-title">Doctor Availability</h1>
        <p className="page-subtitle">Real-time availability slots for today.</p>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-state">Loading availability...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <table className="doctors-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Availability</th>
                <th>Location</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {availability.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-state">No availability found for today.</td>
                </tr>
              ) : (
                availability.map((slot, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="doctor-cell">
                        <div className="doctor-avatar">
                          {slot.doctor.charAt(0)}
                        </div>
                        <div className="doctor-info">
                          <span className="doctor-name">{slot.doctor}</span>
                          <span className="doctor-email">{slot.specialty}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={14} className="text-gray-400" />
                        <span style={{ fontWeight: 500, color: 'var(--primary)' }}>{slot.time}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MapPin size={14} className="text-gray-400" />
                        <span>{slot.location}</span>
                      </div>
                    </td>
                    <td>
                      <button
                        className="action-btn-primary"
                        onClick={() => setSelectedDoctor(slot)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectedDoctor && (
        <div className="modal-overlay" onClick={() => setSelectedDoctor(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Availability Details</h2>
              <button className="close-btn" onClick={() => setSelectedDoctor(null)}>
                <Clock size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="header-card">
                <div className="doctor-avatar-large">
                  {selectedDoctor.doctor.charAt(0)}
                </div>
                <div className="header-info">
                  <h3>{selectedDoctor.doctor}</h3>
                  <p>{selectedDoctor.specialty}</p>
                  <div className="info-row">
                    <MapPin size={14} /> {selectedDoctor.location}
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Available Slots (Today)</h4>
                <div className="slots-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px', marginTop: '10px' }}>
                  {selectedDoctor.raw?.slots?.map((s, i) => (
                    <div key={i} className="slot-item" style={{
                      padding: '8px',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      textAlign: 'center',
                      fontSize: '13px',
                      backgroundColor: '#f0fdf4',
                      color: '#166534',
                      fontWeight: '500'
                    }}>
                      {s.label}
                    </div>
                  )) || <p>No specific slot data available.</p>}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedDoctor(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAvailability;
