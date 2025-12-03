import React, { useMemo, useState } from 'react';
import { Search, CheckCircle, Eye } from 'lucide-react';
import { apiRequest, pickList } from '../../utils/api';
import { useApiData } from '../../hooks/useApiData';
import DoctorDetailsModal from '../../components/Doctors/DoctorDetailsModal';
import './doctors-page.css';

const DoctorsVerified = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [viewDoctor, setViewDoctor] = useState(null);

  const { data, loading, error } = useApiData(async () => {
    const payload = await apiRequest('/api/admin/verifications?status=approved');
    const list = pickList(payload);
    return list.map((item, idx) => ({
      ...item, // Keep all original fields for modal
      id: item._id || item.id || item.doctorId || idx + 1,
      name: item.personalDetails?.fullName || item.fullName || item.name || '-',
      email: item.personalDetails?.email || item.email || '-',
      specialty: item.personalDetails?.medicalSpecialization || item.medicalSpecialization || '-',
      license: item.registration?.registrationNumber || item.registrationNumber || '-',
      status: item.status || 'approved'
    }));
  }, []);

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter(doc =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.license.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <div className="doctors-page">
      <div className="page-header">
        <h1 className="page-title">Verified Doctors</h1>
        <p className="page-subtitle">List of doctors with verified credentials and approved status.</p>
      </div>

      <div className="controls-bar">
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, email, or license..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-state">Loading verified doctors...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <table className="doctors-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialty</th>
                <th>License No.</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">No verified doctors found.</td>
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
                    <td>{doc.license}</td>
                    <td>
                      <span className="status-badge status-approved">
                        <CheckCircle size={12} style={{ marginRight: 4 }} />
                        Verified
                      </span>
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} doctors
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

export default DoctorsVerified;
