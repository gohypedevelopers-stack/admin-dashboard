import React, { useMemo } from 'react';
import AdminTable from '../../components/Common/AdminTable';
import { apiRequest, pickList } from '../../utils/api';
import { useApiData } from '../../hooks/useApiData';

const COLUMNS = [
  { key: 'id', label: 'ID', type: 'text' },
  { key: 'name', label: 'Doctor Name', type: 'text' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'specialty', label: 'Specialty', type: 'text' },
  { key: 'license', label: 'License', type: 'text' },
  { key: 'status', label: 'Status', type: 'text' },
];

const DoctorsVerified = () => {
  const { data, loading, error } = useApiData(async () => {
    const payload = await apiRequest('/api/doctors/verification?status=approved');
    const list = pickList(payload);
    return list.map((item, idx) => ({
      id: item._id || item.id || item.doctorId || idx + 1,
      name: item.personalDetails?.fullName || item.fullName || item.name || '-',
      email: item.personalDetails?.email || item.email || '-',
      specialty: item.personalDetails?.medicalSpecialization || item.medicalSpecialization || '-',
      license: item.registration?.registrationNumber || item.registrationNumber || '-',
      status: item.status || 'approved'
    }));
  }, []);

  const tableData = useMemo(() => data, [data]);

  return (
    <div style={{ padding: '20px' }}>
      {error && <div style={errorBoxStyle}>{error}</div>}
      {loading ? (
        <div style={{ padding: '12px 0', color: '#475569' }}>Loading verified doctors...</div>
      ) : (
        <AdminTable title="Verified Doctors" columns={COLUMNS} initialData={tableData} />
      )}
    </div>
  );
};

const errorBoxStyle = {
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid #fecaca',
  background: '#fee2e2',
  color: '#991b1b',
  marginBottom: 12,
  fontSize: 14
};

export default DoctorsVerified;
