import React, { useEffect, useMemo, useState } from 'react';
import AdminTable from '../../components/Common/AdminTable';
import { apiRequest } from '../../utils/api';
import { useApiData } from '../../hooks/useApiData';
import './doctors-page.css';

const COLUMNS = [
  { key: 'id', label: 'ID', type: 'text' },
  { key: 'name', label: 'Doctor Name', type: 'text' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'specialty', label: 'Specialty', type: 'text' },
  { key: 'city', label: 'City', type: 'text' },
  { key: 'status', label: 'Status', type: 'text' },
];

const DoctorsPage = () => {
  const [filters, setFilters] = useState({
    status: 'all',
    specialization: '',
    city: '',
  });
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'all') {
      params.set('status', filters.status);
    }
    if (filters.specialization) {
      params.set('specialization', filters.specialization);
    }
    if (filters.city) {
      params.set('city', filters.city);
    }
    return params.toString();
  }, [filters]);

  const { data, loading, error } = useApiData(async () => {
    const payload = await apiRequest(`/api/admin/doctors?${query}`);
    return payload?.data || [];
  }, [query, reloadTrigger]);

  const tableData = useMemo(() => data, [data]);

  useEffect(() => {
    if (!selectedDoctor && tableData.length) {
      setSelectedDoctor(tableData[0].id);
    }
  }, [tableData, selectedDoctor]);

  const handleStatusToggle = async () => {
    if (!selectedDoctor) return;
    const doctor = data.find((doc) => doc.id === selectedDoctor);
    if (!doctor) return;
    setActionLoading(true);
    setActionError('');
    try {
      await apiRequest(`/api/admin/doctors/${selectedDoctor}/status`, {
        method: 'PATCH',
        body: { isActive: !doctor.isActive },
      });
      setActionMessage(`Doctor ${doctor.name} is now ${doctor.isActive ? 'inactive' : 'active'}.`);
      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      setActionError(err?.message || 'Unable to update status');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {error && (
        <div style={errorStyle}>
          {error}
        </div>
      )}
      <div className="filters-card">
        <input
          type="text"
          placeholder="Search by specialization"
          value={filters.specialization}
          onChange={(e) => setFilters((prev) => ({ ...prev, specialization: e.target.value }))}
        />
        <input
          type="text"
          placeholder="Filter by city"
          value={filters.city}
          onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
        >
          {['all', 'active', 'inactive'].map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <div style={{ color: '#475569', padding: '12px 0' }}>Loading doctors...</div>
      ) : (
        <>
          <AdminTable title="Doctors Management" columns={COLUMNS} initialData={tableData} />
          <div className="doctor-actions">
            <h3>Doctor actions</h3>
            {actionMessage && <div className="action-message success">{actionMessage}</div>}
            {actionError && <div className="action-message error">{actionError}</div>}
            <div className="action-row">
              <label htmlFor="doctor-select">Select doctor</label>
              <select
                id="doctor-select"
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
              >
                <option value="">Select doctor</option>
                {tableData.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} ({doc.specialization})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleStatusToggle}
                disabled={actionLoading || !selectedDoctor}
              >
                Toggle status
              </button>
            </div>
          </div>
        </>
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

export default DoctorsPage;
