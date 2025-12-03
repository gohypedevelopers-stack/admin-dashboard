import React, { useMemo, useState } from 'react';
import { Search, AlertCircle, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';
import { apiRequest, pickList } from '../../utils/api';
import { useApiData } from '../../hooks/useApiData';
import DoctorDetailsModal from '../../components/Doctors/DoctorDetailsModal';
import './doctors-page.css';

const DoctorStatus = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [viewDoctor, setViewDoctor] = useState(null);

  const { data, loading, error } = useApiData(async () => {
    const payload = await apiRequest('/api/admin/verifications');
    const list = pickList(payload);
    return list.map((item, idx) => ({
      ...item, // Keep all original fields for modal
      id: item._id || item.id || item.doctorId || idx + 1,
      name: item.personalDetails?.fullName || item.fullName || item.name || '-',
      email: item.personalDetails?.email || item.email || '-',
      specialty: item.personalDetails?.medicalSpecialization || item.medicalSpecialization || '-',
      status: item.status || '-',
      statusDetail: item.adminNotes || item.rejectionReason || item.registration?.registrationNumber || '-'
    }));
  }, []);

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter(doc =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return <CheckCircle size={14} />;
      case 'rejected': return <XCircle size={14} />;
      case 'pending': return <Clock size={14} />;
      case 'under_review': return <AlertCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  return (
    <div className="doctors-page">
      <div className="page-header">
        <h1 className="page-title">Doctor Status</h1>
        <p className="page-subtitle">Track verification status and details for all doctors.</p>
      </div>

      <div className="controls-bar">
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-state">Loading doctor statuses...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <table className="doctors-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialty</th>
                <th>Status</th>
                <th>Details</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">No records found.</td>
                </tr>
              ) : (
                paginatedData.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div className="doctor-cell">
                        <div className="doctor-avatar">
                          {getInitials(doc.name)}
                        </div>
                        <div className="doctor-info">
                          <span className="doctor-name">{doc.name}</span>
                          <span className="doctor-email">{doc.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{doc.specialty}</td>
                    <td>
                      <span className={`status-badge status-${doc.status.toLowerCase()}`}>
                        {getStatusIcon(doc.status)}
                        <span style={{ marginLeft: 4 }}>{doc.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td style={{ maxWidth: 300, fontSize: 12, color: '#6b7280' }}>
                      {doc.statusDetail}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="action-btn"
                        title="View Details"
                        onClick={() => setViewDoctor(doc)}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {!loading && !error && filteredData.length > 0 && (
          <div className="pagination">
            <span className="pagination-text">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} records
            </span>
            <div className="pagination-controls">
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                Previous
              </button>
              <button
                className="page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {viewDoctor && (
        <DoctorDetailsModal
          doctor={viewDoctor}
          onClose={() => setViewDoctor(null)}
        />
      )}
    </div>
  );
};

export default DoctorStatus;
