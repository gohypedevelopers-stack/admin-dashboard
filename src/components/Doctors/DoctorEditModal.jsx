import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { doctorService } from '../../services/doctorService';

const DoctorEditModal = ({ doctor, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        specialization: '',
        city: '',
        experienceYears: '',
        consultationFee: '',
        isActive: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
            });
        }
    }, [doctor]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
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
            <div className="modal-content" style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">Edit Doctor Details</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
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

                    <div className="modal-footer" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
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
