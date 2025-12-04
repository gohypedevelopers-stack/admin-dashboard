import React, { useState, useEffect } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { pharmacyService } from '../../services/pharmacyService';
import './product-modal.css';

const ProductModal = ({ isOpen, onClose, product, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        manufacturer: '',
        price: '',
        mrp: '',
        stock: '',
        isPrescriptionRequired: false,
        images: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                category: product.category || '',
                manufacturer: product.manufacturer || '',
                price: product.price || '',
                mrp: product.mrp || '',
                stock: product.stock || '',
                isPrescriptionRequired: product.isPrescriptionRequired || false,
                images: product.images || []
            });
        } else {
            setFormData({
                name: '',
                description: '',
                category: '',
                manufacturer: '',
                price: '',
                mrp: '',
                stock: '',
                isPrescriptionRequired: false,
                images: []
            });
        }
        setError('');
    }, [product, isOpen]);

    if (!isOpen) return null;

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
        setError('');

        try {
            // Create FormData object for file upload if needed, 
            // but for now we'll assume JSON or handle file upload separately if implemented
            // The backend expects multipart/form-data for images

            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'images') {
                    // Handle images if we were uploading new ones, 
                    // for now we just keep existing ones or ignore if empty
                } else {
                    data.append(key, formData[key]);
                }
            });

            if (product) {
                await pharmacyService.updateProduct(product._id || product.id, data);
            } else {
                await pharmacyService.createProduct(data);
            }

            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content product-modal">
                <div className="modal-header">
                    <h2 className="modal-title">{product ? 'Edit Product' : 'Add New Product'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Product Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Paracetamol 500mg"
                            />
                        </div>

                        <div className="form-group">
                            <label>Category</label>
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Medicine, Wellness"
                            />
                        </div>

                        <div className="form-group">
                            <label>Manufacturer</label>
                            <input
                                type="text"
                                name="manufacturer"
                                value={formData.manufacturer}
                                onChange={handleChange}
                                placeholder="e.g. GSK"
                            />
                        </div>

                        <div className="form-group">
                            <label>Stock</label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                required
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Price (Selling)</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div className="form-group">
                            <label>MRP</label>
                            <input
                                type="number"
                                name="mrp"
                                value={formData.mrp}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                        />
                    </div>

                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="isPrescriptionRequired"
                                checked={formData.isPrescriptionRequired}
                                onChange={handleChange}
                            />
                            Prescription Required
                        </label>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Product'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;
