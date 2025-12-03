import React, { useMemo } from 'react';
import AdminTable from '../../components/Common/AdminTable';
import { useApiData } from '../../hooks/useApiData';
import { appointmentService } from '../../services/appointmentService';

const COLUMNS = [
  { key: 'id', label: 'ID', type: 'text' },
  { key: 'doctor', label: 'Doctor', type: 'text' },
  { key: 'specialization', label: 'Specialization', type: 'text' },
  { key: 'date', label: 'Date', type: 'text' },
  { key: 'slot', label: 'Slot', type: 'text' },
  { key: 'status', label: 'Status', type: 'text' },
];

const formatDate = (value) => {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString('en-IN');
};

const formatSlot = (value) => {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const AppointmentList = () => {
  const { data, loading, error } = useApiData(async () => {
    const payload = await appointmentService.getAllAppointments();
    return Array.isArray(payload?.data) ? payload.data : [];
  }, []);

  const tableData = useMemo(
    () =>
      data.map((appt) => ({
        id: appt._id,
        doctor: appt.doctorName || appt.doctor?.userName || 'Unknown doctor',
        specialization: appt.doctorSpecialty || appt.doctor?.specialization || 'General',
        date: formatDate(appt.startTime),
        slot: formatSlot(appt.startTime),
        status: appt.status || 'pending',
      })),
    [data]
  );

  return (
    <div style={{ padding: '20px' }}>
      {error && (
        <div style={errorStyle}>
          {error}
        </div>
      )}
      {loading ? (
        <div style={{ color: '#475569', padding: '12px 0' }}>Loading appointments...</div>
      ) : (
        <AdminTable
          title="Appointments Management"
          columns={COLUMNS}
          initialData={tableData}
        />
      )}
    </div>
  );
};

const errorStyle = {
  padding: '10px 12px',
  border: '1px solid #fecaca',
  borderRadius: 6,
  background: '#fee2e2',
  color: '#991b1b',
  marginBottom: 12,
  fontSize: 14
};

export default AppointmentList;
