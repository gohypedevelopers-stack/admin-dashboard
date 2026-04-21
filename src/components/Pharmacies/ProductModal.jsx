import React, { useEffect, useMemo, useState } from 'react';
import { X, Loader2, Upload, ImagePlus, Trash2 } from 'lucide-react';
import { pharmacyService } from '../../services/pharmacyService';
import './product-modal.css';

const normalizeExistingImages = (images = []) =>
  (Array.isArray(images) ? images : []).map((image, index) => ({
    key: image.fileId || image.filename || image.url || `existing-${index}`,
    url: image.url || image.path || '',
    filename: image.filename || image.originalName || `image-${index + 1}`,
    original: image,
  }));

const normalizeExpiryForInput = (value) => {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();

  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  if (/^\d{2}\/\d{4}$/.test(trimmed)) {
    const [month, year] = trimmed.split('/');
    return `${year}-${month}`;
  }

  return '';
};

const serializeExpiryForSave = (value) => {
  if (!value) return '';
  if (!/^\d{4}-\d{2}$/.test(value)) return value;

  const [year, month] = value.split('-');
  return `${month}/${year}`;
};

const ProductModal = ({ isOpen, onClose, product, productToEdit, onSuccess }) => {
  const currentProduct = product || productToEdit || null;
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    brand: '',
    price: '',
    mrp: '',
    discountPercent: '',
    stock: '',
    dosageForm: '',
    strength: '',
    expiry: '',
    tags: '',
    status: 'active',
    isPrescriptionRequired: false,
  });
  const [existingImages, setExistingImages] = useState([]);
  const [removedImageFilenames, setRemovedImageFilenames] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentProduct) {
      setFormData({
        name: currentProduct.name || '',
        sku: currentProduct.sku || '',
        description: currentProduct.description || '',
        category: currentProduct.category || '',
        brand: currentProduct.brand || currentProduct.manufacturer || '',
        price: currentProduct.price ?? '',
        mrp: currentProduct.mrp ?? '',
        discountPercent: currentProduct.discountPercent ?? '',
        stock: currentProduct.stock ?? '',
        dosageForm: currentProduct.dosageForm || '',
        strength: currentProduct.strength || '',
        expiry: normalizeExpiryForInput(currentProduct.expiry),
        tags: Array.isArray(currentProduct.tags) ? currentProduct.tags.join(', ') : '',
        status: currentProduct.status || 'active',
        isPrescriptionRequired: !!currentProduct.isPrescriptionRequired,
      });
      setExistingImages(normalizeExistingImages(currentProduct.images));
    } else {
      setFormData({
        name: '',
        sku: '',
        description: '',
        category: '',
        brand: '',
        price: '',
        mrp: '',
        discountPercent: '',
        stock: '',
        dosageForm: '',
        strength: '',
        expiry: '',
        tags: '',
        status: 'active',
        isPrescriptionRequired: false,
      });
      setExistingImages([]);
    }

    setRemovedImageFilenames([]);
    setNewImages([]);
    setError('');
  }, [currentProduct, isOpen]);

  const newImagePreviews = useMemo(
    () =>
      newImages.map((file) => ({
        key: `${file.name}-${file.lastModified}`,
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [newImages]
  );

  useEffect(() => () => {
    newImagePreviews.forEach((image) => URL.revokeObjectURL(image.url));
  }, [newImagePreviews]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    setNewImages((prev) => {
      const combined = [...prev, ...selected];
      return combined.slice(0, 5);
    });

    e.target.value = '';
  };

  const removeExistingImage = (image) => {
    setExistingImages((prev) => prev.filter((item) => item.key !== image.key));
    if (image.filename) {
      setRemovedImageFilenames((prev) =>
        prev.includes(image.filename) ? prev : [...prev, image.filename]
      );
    }
  };

  const removeNewImage = (key) => {
    setNewImages((prev) =>
      prev.filter((file) => `${file.name}-${file.lastModified}` !== key)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '' && value !== null && typeof value !== 'undefined') {
          data.append(key, key === 'expiry' ? serializeExpiryForSave(value) : value);
        }
      });

      if (removedImageFilenames.length) {
        data.append('removeImageFilenames', JSON.stringify(removedImageFilenames));
      }

      newImages.forEach((file) => {
        data.append('images', file);
      });

      if (currentProduct) {
        await pharmacyService.updateProduct(currentProduct._id || currentProduct.id, data);
      } else {
        await pharmacyService.createProduct(data);
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content product-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{currentProduct ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-grid">
            <div className="form-group">
              <label>Product Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>SKU</label>
              <input type="text" name="sku" value={formData.sku} onChange={handleChange} placeholder="Optional" />
            </div>

            <div className="form-group">
              <label>Category</label>
              <input type="text" name="category" value={formData.category} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Brand</label>
              <input type="text" name="brand" value={formData.brand} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Stock</label>
              <input type="number" name="stock" min="0" value={formData.stock} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="form-group">
              <label>Price</label>
              <input type="number" name="price" min="0" step="0.01" value={formData.price} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>MRP</label>
              <input type="number" name="mrp" min="0" step="0.01" value={formData.mrp} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Discount %</label>
              <input type="number" name="discountPercent" min="0" step="0.01" value={formData.discountPercent} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Expiry</label>
              <input type="month" name="expiry" value={formData.expiry} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Dosage Form</label>
              <input type="text" name="dosageForm" value={formData.dosageForm} onChange={handleChange} placeholder="Tablet, Syrup, Capsule" />
            </div>

            <div className="form-group">
              <label>Strength</label>
              <input type="text" name="strength" value={formData.strength} onChange={handleChange} placeholder="500mg" />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" />
          </div>

          <div className="form-group">
            <label>Tags</label>
            <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="pain relief, fever, otc" />
          </div>

          <div className="form-group">
            <label>Product Images</label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                minHeight: 120,
                border: '1.5px dashed #cbd5e1',
                borderRadius: 16,
                background: '#f8fafc',
                color: '#475569',
                cursor: 'pointer',
                padding: 20,
              }}
            >
              <input type="file" accept="image/*" multiple onChange={handleImageSelect} style={{ display: 'none' }} />
              <ImagePlus size={20} />
              <span>Upload product images</span>
            </label>
            <p style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>
              You can upload up to 5 images. New images will be saved to ImageKit.
            </p>
          </div>

          {(existingImages.length > 0 || newImagePreviews.length > 0) && (
            <div className="form-group">
              <label>Image Preview</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
                {existingImages.map((image) => (
                  <div
                    key={image.key}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: 14,
                      padding: 8,
                      background: '#fff',
                    }}
                  >
                    <img
                      src={image.url}
                      alt={image.filename}
                      style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 10, background: '#f8fafc' }}
                    />
                    <div style={{ marginTop: 8, fontSize: 11, color: '#475569', wordBreak: 'break-word' }}>
                      {image.filename}
                    </div>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ width: '100%', marginTop: 8 }}
                      onClick={() => removeExistingImage(image)}
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                ))}

                {newImagePreviews.map((image) => (
                  <div
                    key={image.key}
                    style={{
                      border: '1px solid #bfdbfe',
                      borderRadius: 14,
                      padding: 8,
                      background: '#eff6ff',
                    }}
                  >
                    <img
                      src={image.url}
                      alt={image.name}
                      style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 10, background: '#dbeafe' }}
                    />
                    <div style={{ marginTop: 8, fontSize: 11, color: '#1e3a8a', wordBreak: 'break-word' }}>
                      {image.name}
                    </div>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ width: '100%', marginTop: 8 }}
                      onClick={() => removeNewImage(image.key)}
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                <>
                  <Upload size={16} />
                  Save Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
