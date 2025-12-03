import React, { useEffect, useMemo, useState } from 'react';
import { Search, Filter, MoreVertical, Trash2, Shield, AlertCircle, CheckCircle, Eye } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData';
import { doctorService } from '../../services/doctorService';
import DoctorEditModal from '../../components/Doctors/DoctorEditModal';
import DoctorDetailsModal from '../../components/Doctors/DoctorDetailsModal';
import './doctors-page.css';

const DoctorsPage = () => {
  const [filters, setFilters] = useState({
    status: 'all',
    specialization: '',
    city: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal State
  const [viewDoctor, setViewDoctor] = useState(null);
  const [editDoctor, setEditDoctor] = useState(null);

  const { data, loading, error } = useApiData(async () => {
    const payload = await doctorService.getAllDoctors();
    let list = payload?.data || [];

    // Client-side filtering for specific fields if needed
    if (filters.status && filters.status !== 'all') {
      const isActive = filters.status === 'active';
      list = list.filter(d => !!d.isActive === isActive);
    }
    if (filters.specialization) {
      list = list.filter(d => d.specialization?.toLowerCase().includes(filters.specialization.toLowerCase()));
    }
    if (filters.city) {
      list = list.filter(d => d.city?.toLowerCase().includes(filters.city.toLowerCase()));
    }

    return list.map(doc => ({
      ...doc, // Keep all original fields for the modal
      id: doc._id,
      name: doc.user?.userName || 'Unknown',
      email: doc.user?.email || 'Unknown',
      specialization: doc.specialization || '-',
      city: doc.city || '-',
      status: doc.isActive ? 'Active' : 'Inactive',
      isActive: doc.isActive
    }));
  }, [filters, reloadTrigger]);

  // Search Filtering
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter(doc =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedDoctors(paginatedData.map(d => d.id));
    } else {
      setSelectedDoctors([]);
    }
  };

  const handleSelectDoctor = (id) => {
    setSelectedDoctors(prev =>
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const handleUpdate = () => {
    setReloadTrigger(prev => prev + 1);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="doctors-page">
      <div className="page-header">
        <h1 className="page-title">Doctors Management</h1>
        <p className="page-subtitle">Manage registered doctors, their verification status, and availability.</p>
      </div>

      <div className="controls-bar">
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, email, or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <input
            type="text"
            className="filter-select"
            style={{ width: 140 }}
            placeholder="Filter City"
            value={filters.city}
            onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
          />
          <select
            className="filter-select"
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-state">Loading doctors...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <table className="doctors-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={paginatedData.length > 0 && selectedDoctors.length === paginatedData.length}
                  />
                </th>
                <th>Doctor</th>
                <th>Specialization</th>
                <th>City</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">No doctors found matching your criteria.</td>
                </tr>
              ) : (
                paginatedData.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedDoctors.includes(doc.id)}
                        onChange={() => handleSelectDoctor(doc.id)}
                      />
                    </td>
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
                    <td>{doc.specialization}</td>
                    <td>{doc.city}</td>
                    <td>
                      <span className={`status-badge status-${doc.status.toLowerCase()}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <button
                          className="action-btn"
                          title="View Details"
                          onClick={() => setViewDoctor(doc)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="action-btn-primary"
                          onClick={() => setEditDoctor(doc)}
                        >
                          Action
                        </button>
                      </div>
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

      {/* Details Modal */}
      {viewDoctor && (
        <DoctorDetailsModal
          doctor={viewDoctor}
          onClose={() => setViewDoctor(null)}
        />
      )}

      {/* Edit Modal */}
      {editDoctor && (
        <DoctorEditModal
          doctor={editDoctor}
          onClose={() => setEditDoctor(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default DoctorsPage;
