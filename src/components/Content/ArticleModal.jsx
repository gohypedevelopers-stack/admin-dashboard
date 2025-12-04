import React, { useState, useEffect } from 'react';
import { X, Upload, Calendar, Clock, Type, Image as ImageIcon, FileText } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import '../Pharmacies/product-modal.css'; // Reusing modal styles

const ArticleModal = ({ isOpen, onClose, onSuccess, articleToEdit = null }) => {
    const [formData, setFormData] = useState({
        title: '',
        image: '',
        date: '',
        time: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (articleToEdit) {
            setFormData({
                title: articleToEdit.title || '',
                image: articleToEdit.image || '',
                date: articleToEdit.date || '',
                time: articleToEdit.time || ''
            });
        } else {
            setFormData({
                title: '',
                image: '',
                date: new Date().toISOString().split('T')[0],
                time: ''
            });
        }
        setError(null);
    }, [articleToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Using the new endpoint we just added
            const response = await apiRequest('/api/admin/health-articles', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            console.log('Article creation response:', response);

            onSuccess();
            onClose();
        } catch (err) {
            console.error('Failed to save article:', err);
            setError(err.message || 'Failed to save article');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content product-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {articleToEdit ? 'Edit Article' : 'Add New Article'}
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {error && (
                        <div className="error-message" style={{
                            padding: '10px',
                            background: '#fee2e2',
                            color: '#991b1b',
                            borderRadius: '6px',
                            marginBottom: '16px',
                            fontSize: '14px'
                        }}>
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">
                            <Type size={16} /> Article Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            className="form-input"
                            placeholder="e.g. 10 Tips for Healthy Living"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <ImageIcon size={16} /> Image URL
                        </label>
                        <input
                            type="url"
                            name="image"
                            className="form-input"
                            placeholder="https://example.com/image.jpg"
                            value={formData.image}
                            onChange={handleChange}
                            required
                        />
                        <small style={{ color: '#64748b', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                            Provide a direct link to an image (e.g. from Unsplash)
                        </small>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                <Calendar size={16} /> Date
                            </label>
                            <input
                                type="date"
                                name="date"
                                className="form-input"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <Clock size={16} /> Time to Read
                            </label>
                            <input
                                type="text"
                                name="time"
                                className="form-input"
                                placeholder="e.g. 5 min read"
                                value={formData.time}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <FileText size={16} /> Content / Description
                        </label>
                        <textarea
                            name="description"
                            className="form-input"
                            placeholder="Write the article content here..."
                            value={formData.description || ''}
                            onChange={handleChange}
                            rows={6}
                            required
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : (articleToEdit ? 'Update Article' : 'Create Article')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ArticleModal;
