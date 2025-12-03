import React, { useMemo } from 'react';
import { Calendar, User, Clock } from 'lucide-react';
import { apiRequest, pickList } from '../../utils/api';
import { useApiData } from '../../hooks/useApiData';
import './doctors-page.css';

const DoctorTodayBooked = () => {
  const { data, loading, error } = useApiData(async () => {
    const payload = await apiRequest('/api/admin/appointments?limit=100');
    const list = pickList(payload);

    const today = new Date().toISOString().split('T')[0];
    const todayBookings = list.filter(item => item.startTime && item.startTime.startsWith(today));

    return todayBookings.slice(0, 5).map((item) => ({
      id: item._id,
      doctor: item.doctor?.user?.userName || item.doctor?.userName || item.doctor?.name || 'Unknown Doctor',
      patient: item.patient?.userName || 'Unknown Patient',
      time: new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: item.status.charAt(0).toUpperCase() + item.status.slice(1)
    }));
  }, []);

  const bookings = useMemo(() => data, [data]);

  return (
    <div className="doctors-page">
      <div className="page-header">
        <h1 className="page-title">Today's Bookings</h1>
        <p className="page-subtitle">Appointments scheduled for today.</p>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-state">Loading bookings...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <table className="doctors-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Patient</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-state">No bookings for today.</td>
                </tr>
              ) : (
                bookings.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="doctor-cell">
                        <div className="doctor-avatar">
                          {item.doctor.charAt(0)}
                        </div>
                        <div className="doctor-info">
                          <span className="doctor-name">{item.doctor}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <User size={14} className="text-gray-400" />
                        <span>{item.patient}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Clock size={14} className="text-gray-400" />
                        <span>{item.time}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
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

export default DoctorTodayBooked;
