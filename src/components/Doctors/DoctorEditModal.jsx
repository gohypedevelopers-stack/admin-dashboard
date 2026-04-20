import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { doctorService } from '../../services/doctorService';
import { apiRequest } from '../../utils/api';

const DoctorEditModal = ({ doctor, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        specialization: '',
        city: '',
        experienceYears: '',
        consultationFee: '',
        isActive: false,
        services: [],
    });
    const [loading, setLoading] = useState(false);
    const [servicesLoading, setServicesLoading] = useState(false);
    const [error, setError] = useState(null);
    const [availableServices, setAvailableServices] = useState([]);

    useEffect(() => {
        if (doctor) {
            setFormData({
                userName: doctor.name || '',
                email: doctor.email || '',
                specialization: doctor.specialization || '',
                city: doctor.city || '',
                experienceYears: doctor.experienceYears || '',
                consultationFee: doctor.consultationFee || '',
                isActive: doctor.isActive || false,
                services: Array.isArray(doctor.services) ? doctor.services : [],
            });
        }
    }, [doctor]);

    useEffect(() => {
        const loadDoorstepContent = async () => {
            try {
                setServicesLoading(true);
                const payload = await apiRequest('/api/admin/doorstep-content');
                const services = Array.isArray(payload?.data?.services) ? payload.data.services : [];
                const options = [];

                services.forEach((service) => {
                    if (!service?.title) return;
                    options.push({
                        key: `service-${service.serviceKey || service.title}`,
                        label: service.title,
                        value: service.doctorFilterValue || service.title,
                        type: 'Service',
                    });

                    const subCategories = Array.isArray(service.subCategories) ? service.subCategories : [];
                    subCategories.forEach((subItem, index) => {
                        if (!subItem?.title) return;
                        options.push({
                            key: `subcategory-${service.serviceKey || service.title}-${index}`,
                            label: `${service.title} / ${subItem.title}`,
                            value: subItem.doctorFilterValue || subItem.title,
                            type: 'Sub-category',
                        });
                    });
                });

                setAvailableServices(options);
            } catch (_) {
                setAvailableServices([]);
            } finally {
                setServicesLoading(false);
            }
        };

        loadDoorstepContent();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const toggleService = (serviceLabel) => {
        setFormData((prev) => {
            const exists = prev.services.includes(serviceLabel);
            return {
                ...prev,
                services: exists
                    ? prev.services.filter((item) => item !== serviceLabel)
                    : [...prev.services, serviceLabel],
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await doctorService.updateDoctor(doctor.id, formData);
            onUpdate();
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to update doctor details');
        } finally {
            setLoading(false);
        }
    };

    if (!doctor) return null;

    return (
        <div className="modal-overlay">
            <div
                className="modal-content"
                style={{
                    maxWidth: '600px',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <div className="modal-header">
                    <h2 className="modal-title">Edit Doctor Details</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="modal-body"
                    style={{
                        overflowY: 'auto',
                        paddingRight: '8px'
                    }}
                >
                    {error && (
                        <div className="error-banner" style={{ marginBottom: '16px', padding: '10px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Name</label>
                            <input
                                type="text"
                                name="userName"
                                className="form-input"
                                value={formData.userName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Specialization</label>
                            <input
                                type="text"
                                name="specialization"
                                className="form-input"
                                value={formData.specialization}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">City</label>
                            <input
                                type="text"
                                name="city"
                                className="form-input"
                                value={formData.city}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Experience (Years)</label>
                            <input
                                type="number"
                                name="experienceYears"
                                className="form-input"
                                value={formData.experienceYears}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Consultation Fee</label>
                            <input
                                type="number"
                                name="consultationFee"
                                className="form-input"
                                value={formData.consultationFee}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '24px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                            Doorstep Services Assignment
                        </h4>
                        <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#6b7280' }}>
                            Select the service cards where this doctor should appear in the app.
                        </p>

                        {servicesLoading ? (
                            <div style={{ fontSize: '13px', color: '#6b7280' }}>Loading services...</div>
                        ) : availableServices.length === 0 ? (
                            <div style={{ fontSize: '13px', color: '#6b7280' }}>No admin-managed services found.</div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                                {availableServices.map((service) => {
                                    const label = service.value;
                                    return (
                                        <label
                                            key={service.key}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '8px',
                                                padding: '10px 12px',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                background: '#fff'
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formData.services.includes(label)}
                                                onChange={() => toggleService(label)}
                                                style={{ marginTop: '2px' }}
                                            />
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{service.label}</div>
                                                <div style={{ fontSize: '11px', color: '#6b7280' }}>
                                                    Type: {service.type}
                                                </div>
                                                {service.value ? (
                                                    <div style={{ fontSize: '11px', color: '#6b7280' }}>
                                                        Match key: {service.value}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="status-toggle-section" style={{ marginTop: '24px', padding: '16px', background: '#f9fafb', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#111827' }}>Account Status</h4>
                            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                                {formData.isActive ? 'Doctor account is currently active.' : 'Doctor account is currently inactive.'}
                            </p>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    <div
                        className="modal-footer"
                        style={{
                            marginTop: '24px',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px',
                            position: 'sticky',
                            bottom: 0,
                            background: '#fff',
                            paddingTop: '16px',
                            borderTop: '1px solid #e5e7eb'
                        }}
                    >
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {loading ? 'Saving...' : (
                                <>
                                    <Save size={16} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DoctorEditModal;
