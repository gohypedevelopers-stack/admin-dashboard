import React, { useMemo, useState } from 'react';
import { Search, Filter, Eye, Calendar, Clock } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData';
import { appointmentService } from '../../services/appointmentService';
import AppointmentDetailsModal from '../../components/Appointments/AppointmentDetailsModal';
import './appointments-page.css';

const AppointmentList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, loading, error } = useApiData(async () => {
    const payload = await appointmentService.getAllAppointments();
    return Array.isArray(payload?.data) ? payload.data : [];
  }, []);

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter(appt =>
      (appt.doctorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appt.patientName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const formatDate = (value) => {
    if (!value) return '—';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const formatTime = (value) => {
    if (!value) return '—';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? value
      : parsed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="appointments-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-subtitle">Manage and track all patient appointments.</p>
        </div>
      </div>

      <div className="table-container">
        <div className="controls-bar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search doctor or patient..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="action-btn">
            <Filter size={18} />
          </button>
        </div>

        {loading ? (
          <div className="loading-state">Loading appointments...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Patient</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">No appointments found.</td>
                </tr>
              ) : (
                filteredData.map((appt) => (
                  <tr key={appt._id}>
                    <td>
                      <div className="doctor-info">
                        <span className="name">
                          {appt.doctor?.user?.userName || appt.doctorName || 'Unknown Doctor'}
                        </span>
                        <span className="sub-text">
                          {appt.doctor?.specialization || appt.doctorSpecialty || 'General'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="patient-info">
                        <span className="name">
                          {appt.patient?.userName || appt.patientName || 'Unknown Patient'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="doctor-info">
                        <span className="name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Calendar size={14} /> {formatDate(appt.startTime)}
                        </span>
                        <span className="sub-text" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={14} /> {formatTime(appt.startTime)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${(appt.status || 'pending').toLowerCase()}`}>
                        {appt.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-view"
                        onClick={() => handleViewDetails(appt)}
                      >
                        <Eye size={16} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <AppointmentDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        appointment={selectedAppointment}
      />
    </div>
  );
};

export default AppointmentList;
