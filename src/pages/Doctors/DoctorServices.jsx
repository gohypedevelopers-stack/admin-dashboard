import React, { useMemo, useState } from 'react';
import { Search, Filter, Briefcase, User, MapPin, Award, FileText } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData';
import { doctorService } from '../../services/doctorService';
import './doctors-page.css';

const DOORSTEP_SERVICES = [
    'Home Doctor',
    'Yoga Trainer',
    'Elderly Care',
    'Physiotherapy',
    'Blood Test',
    'Nursing & Caring',
    'Post-Operative Care',
    'Vaccination',
    'Wound Dressing',
    'Medical Attendant'
];

const DoctorServices = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [serviceFilter, setServiceFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { data, loading, error } = useApiData(async () => {
        const payload = await doctorService.getAllDoctors();
        let list = payload?.data || [];

        // Map to include all relevant fields
        return list.map(doc => ({
            id: doc._id,
            name: doc.user?.userName || 'Unknown Doctor',
            email: doc.user?.email || '-',
            specialization: doc.specialization || '-',
            city: doc.city || '-',
            services: doc.services || [],
            about: doc.about || '',
            qualification: doc.qualification || '',
            experienceYears: doc.experienceYears || 0,
            consultationFee: doc.consultationFee || 0,
            isActive: doc.isActive
        }));
    }, []);

    // Filter doctors who have at least one doorstep service
    const doctorsWithServices = useMemo(() => {
        if (!data) return [];
        return data.filter(doc => doc.services && doc.services.length > 0);
    }, [data]);

    // Apply search and service filter
    const filteredData = useMemo(() => {
        let result = doctorsWithServices;

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(doc =>
                doc.name.toLowerCase().includes(term) ||
                doc.email.toLowerCase().includes(term) ||
                doc.specialization.toLowerCase().includes(term) ||
                doc.services.some(s => s.toLowerCase().includes(term))
            );
        }

        // Filter by specific service
        if (serviceFilter !== 'all') {
            result = result.filter(doc => doc.services.includes(serviceFilter));
        }

        return result;
    }, [doctorsWithServices, searchTerm, serviceFilter]);

    // Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Get unique services from all doctors for filter dropdown
    const allServicesInUse = useMemo(() => {
        if (!doctorsWithServices) return [];
        const servicesSet = new Set();
        doctorsWithServices.forEach(doc => {
            doc.services.forEach(s => servicesSet.add(s));
        });
        return Array.from(servicesSet).sort();
    }, [doctorsWithServices]);

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
                <h1 className="page-title">Doorstep Services</h1>
                <p className="page-subtitle">View doctors offering doorstep healthcare services like Home Doctor, Physiotherapy, Blood Tests, and more.</p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', borderRadius: 12, padding: 20 }}>
                    <div style={{ fontSize: 32, fontWeight: 700 }}>{doctorsWithServices.length}</div>
                    <div style={{ fontSize: 14, opacity: 0.9 }}>Doctors with Services</div>
                </div>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', borderRadius: 12, padding: 20 }}>
                    <div style={{ fontSize: 32, fontWeight: 700 }}>{allServicesInUse.length}</div>
                    <div style={{ fontSize: 14, opacity: 0.9 }}>Active Services</div>
                </div>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: 'white', borderRadius: 12, padding: 20 }}>
                    <div style={{ fontSize: 32, fontWeight: 700 }}>{data?.length || 0}</div>
                    <div style={{ fontSize: 14, opacity: 0.9 }}>Total Doctors</div>
                </div>
            </div>

            {/* Controls */}
            <div className="controls-bar">
                <div className="search-wrapper">
                    <Search size={16} className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by name, email, specialty, or service..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filters-group">
                    <select
                        className="filter-select"
                        value={serviceFilter}
                        onChange={(e) => { setServiceFilter(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="all">All Services</option>
                        {allServicesInUse.map(service => (
                            <option key={service} value={service}>{service}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Doctors Cards */}
            <div className="table-container" style={{ padding: 24 }}>
                {loading ? (
                    <div className="loading-state">Loading doctors...</div>
                ) : error ? (
                    <div className="error-state">{error}</div>
                ) : paginatedData.length === 0 ? (
                    <div className="empty-state">No doctors found offering doorstep services.</div>
                ) : (
                    <div style={{ display: 'grid', gap: 20 }}>
                        {paginatedData.map((doc) => (
                            <div key={doc.id} style={{
                                background: '#fff',
                                border: '1px solid var(--border)',
                                borderRadius: 12,
                                padding: 24,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                            }}>
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 16 }}>
                                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                        <div className="doctor-avatar" style={{ width: 56, height: 56, fontSize: 20 }}>
                                            {getInitials(doc.name)}
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{doc.name}</h3>
                                            <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 14 }}>
                                                {doc.qualification ? `${doc.qualification} - ` : ''}{doc.specialization}
                                            </p>
                                            <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 13, color: 'var(--text-tertiary)' }}>
                                                <span><MapPin size={12} style={{ marginRight: 4 }} />{doc.city}</span>
                                                <span><Award size={12} style={{ marginRight: 4 }} />{doc.experienceYears} years exp.</span>
                                                <span>₹{doc.consultationFee} fee</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`status-badge status-${doc.isActive ? 'active' : 'inactive'}`}>
                                        {doc.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                {/* About Section */}
                                {doc.about && (
                                    <div style={{ marginBottom: 16, padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                                        <h4 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <User size={14} /> About Doctor
                                        </h4>
                                        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5 }}>{doc.about}</p>
                                    </div>
                                )}

                                {/* Services */}
                                <div>
                                    <h4 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Briefcase size={14} /> Doorstep Services Offered
                                    </h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {doc.services.map(service => (
                                            <span
                                                key={service}
                                                style={{
                                                    padding: '6px 12px',
                                                    background: DOORSTEP_SERVICES.includes(service) ? '#dbeafe' : '#f1f5f9',
                                                    color: DOORSTEP_SERVICES.includes(service) ? '#1e40af' : '#475569',
                                                    borderRadius: 6,
                                                    fontSize: 13,
                                                    fontWeight: 500,
                                                    border: `1px solid ${DOORSTEP_SERVICES.includes(service) ? '#93c5fd' : '#e2e8f0'}`
                                                }}
                                            >
                                                {service}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && !error && filteredData.length > 0 && (
                    <div className="pagination" style={{ marginTop: 24 }}>
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
        </div>
    );
};

export default DoctorServices;
