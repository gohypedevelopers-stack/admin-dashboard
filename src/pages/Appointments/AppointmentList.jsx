import React, { useMemo, useState } from 'react';
import { Search, Eye, Calendar, Clock, Stethoscope, UserRound, CheckCircle2, ClipboardCheck } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData';
import { appointmentService } from '../../services/appointmentService';
import AppointmentDetailsModal from '../../components/Appointments/AppointmentDetailsModal';
import './appointments-page.css';
import '../../styles/admin-panel.css';

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

  const stats = useMemo(() => {
    const source = data || [];
    return {
      total: source.length,
      pending: source.filter((appt) => (appt.status || 'pending') === 'pending').length,
      confirmed: source.filter((appt) => (appt.status || '').toLowerCase() === 'confirmed').length,
      completed: source.filter((appt) => (appt.status || '').toLowerCase() === 'completed').length,
    };
  }, [data]);

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
    <div className="admin-panel-page appointments-page">
      <div className="admin-panel-hero">
        <div>
          <div className="admin-panel-kicker">
            <ClipboardCheck size={14} />
            Appointments Desk
          </div>
          <h1 className="admin-panel-title">Appointments</h1>
          <p className="admin-panel-subtitle">Review upcoming consultations, inspect patient-doctor assignments, and keep the booking queue easy to scan.</p>
        </div>
      </div>

      <div className="admin-panel-stats">
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">All Bookings</p>
          <div className="admin-panel-stat-value">{stats.total}</div>
          <p className="admin-panel-stat-note">Appointments in the system</p>
        </div>
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Pending</p>
          <div className="admin-panel-stat-value">{stats.pending}</div>
          <p className="admin-panel-stat-note">Awaiting confirmation</p>
        </div>
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Confirmed</p>
          <div className="admin-panel-stat-value">{stats.confirmed}</div>
          <p className="admin-panel-stat-note">Scheduled and active</p>
        </div>
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Completed</p>
          <div className="admin-panel-stat-value">{stats.completed}</div>
          <p className="admin-panel-stat-note">Closed successfully</p>
        </div>
      </div>

      <div className="admin-panel-card table-container">
        <div className="admin-panel-toolbar controls-bar">
          <div className="admin-panel-search search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search doctor or patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="admin-panel-toolbar-meta">
            <span className="admin-panel-chip">
              <CheckCircle2 size={14} />
              {filteredData.length} results
            </span>
          </div>
        </div>

        {loading ? (
          <div className="admin-panel-empty loading-state">Loading appointments...</div>
        ) : error ? (
          <div className="admin-panel-empty error-state">{error}</div>
        ) : (
          <table className="admin-panel-table appointments-table">
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
                  <td colSpan="5" className="admin-panel-empty empty-state">No appointments found.</td>
                </tr>
              ) : (
                filteredData.map((appt) => (
                  <tr key={appt._id}>
                    <td>
                      <div className="admin-panel-entity doctor-info">
                        <div className="admin-panel-avatar">
                          <Stethoscope size={18} />
                        </div>
                        <div>
                        <span className="admin-panel-entity-title name">
                          {appt.doctor?.user?.userName || appt.doctorName || 'Unknown Doctor'}
                        </span>
                        <span className="admin-panel-entity-subtitle sub-text">
                          {appt.doctor?.specialization || appt.doctorSpecialty || 'General'}
                        </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="admin-panel-entity patient-info">
                        <div className="admin-panel-avatar" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', color: '#b45309' }}>
                          <UserRound size={18} />
                        </div>
                        <div>
                        <span className="admin-panel-entity-title name">
                          {appt.patient?.userName || appt.patientName || 'Unknown Patient'}
                        </span>
                        </div>
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
                        className="admin-action-button"
                        onClick={() => handleViewDetails(appt)}
                      >
                        <Eye size={16} /> View Details
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
