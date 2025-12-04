import React from 'react';
import { X, Calendar, Clock, User, Stethoscope, MapPin } from 'lucide-react';
import '../../pages/Appointments/appointments-page.css';

const AppointmentDetailsModal = ({ isOpen, onClose, appointment }) => {
    if (!isOpen || !appointment) return null;

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Appointment Details</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="detail-row">
                        <span className="detail-label"><User size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Patient</span>
                        <span className="detail-value">{appointment.patient?.userName || appointment.patientName || 'Unknown'}</span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label"><Stethoscope size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Doctor</span>
                        <span className="detail-value">{appointment.doctor?.user?.userName || appointment.doctorName || 'Unknown'}</span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label">Specialization</span>
                        <span className="detail-value">{appointment.doctor?.specialization || appointment.doctorSpecialty || 'General'}</span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label"><Calendar size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Date</span>
                        <span className="detail-value">{formatDate(appointment.startTime)}</span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label"><Clock size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Time</span>
                        <span className="detail-value">{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label">Status</span>
                        <span className={`status-badge status-${(appointment.status || 'pending').toLowerCase()}`}>
                            {appointment.status || 'Pending'}
                        </span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label">Type</span>
                        <span className="detail-value">{appointment.type || 'In-person'}</span>
                    </div>

                    {appointment.notes && (
                        <div className="detail-row" style={{ flexDirection: 'column', gap: 8 }}>
                            <span className="detail-label">Notes</span>
                            <span className="detail-value" style={{ textAlign: 'left', background: '#f9fafb', padding: 10, borderRadius: 8 }}>
                                {appointment.notes}
                            </span>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-close" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default AppointmentDetailsModal;
