import React, { useEffect, useMemo, useState } from 'react';
import { X, Upload, Calendar, Clock, Type, Image as ImageIcon, FileText, Loader2, Trash2 } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import '../Pharmacies/product-modal.css';

const ArticleModal = ({ isOpen, onClose, onSuccess, articleToEdit = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    date: '',
    time: '',
    description: '',
  });
  const [newImageFile, setNewImageFile] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (articleToEdit) {
      setFormData({
        title: articleToEdit.title || '',
        image: articleToEdit.image || '',
        date: articleToEdit.date || '',
        time: articleToEdit.time || '',
        description: articleToEdit.description || '',
      });
    } else {
      setFormData({
        title: '',
        image: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        description: '',
      });
    }

    setNewImageFile(null);
    setImageRemoved(false);
    setError(null);
  }, [articleToEdit, isOpen]);

  const previewUrl = useMemo(() => {
    if (newImageFile) {
      return URL.createObjectURL(newImageFile);
    }
    if (!imageRemoved) {
      return formData.image;
    }
    return '';
  }, [newImageFile, imageRemoved, formData.image]);

  useEffect(() => () => {
    if (newImageFile && previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [newImageFile, previewUrl]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewImageFile(file);
    setImageRemoved(false);
    e.target.value = '';
  };

  const clearSelectedImage = () => {
    setNewImageFile(null);
    if (articleToEdit) {
      setImageRemoved(true);
      setFormData((prev) => ({ ...prev, image: '' }));
    } else {
      setFormData((prev) => ({ ...prev, image: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = articleToEdit
        ? `/api/admin/health-articles/${articleToEdit._id}`
        : '/api/admin/health-articles';

      const method = articleToEdit ? 'PUT' : 'POST';
      const data = new FormData();

      data.append('title', formData.title);
      data.append('date', formData.date);
      data.append('time', formData.time);
      data.append('description', formData.description);

      if (newImageFile) {
        data.append('image', newImageFile);
      } else if (formData.image) {
        data.append('image', formData.image);
      }

      const response = await apiRequest(url, {
        method,
        body: data,
      });

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        throw new Error(response.message || 'Operation failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to save article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content product-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{articleToEdit ? 'Edit Article' : 'Add New Article'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div
              className="error-message"
              style={{
                padding: '10px',
                background: '#fee2e2',
                color: '#991b1b',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '14px',
              }}
            >
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
              <ImageIcon size={16} /> Article Image
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                minHeight: 110,
                border: '1.5px dashed #cbd5e1',
                borderRadius: 16,
                background: '#f8fafc',
                color: '#475569',
                cursor: 'pointer',
                padding: 20,
              }}
            >
              <input type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
              <Upload size={18} />
              <span>{newImageFile ? 'Change article image' : 'Upload article image'}</span>
            </label>
            <small style={{ color: '#64748b', fontSize: '12px', marginTop: '6px', display: 'block' }}>
              Selected image will be uploaded to ImageKit when you save the article.
            </small>
          </div>

          {previewUrl ? (
            <div className="form-group">
              <label className="form-label">Image Preview</label>
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 16,
                  padding: 10,
                  background: '#fff',
                }}
              >
                <img
                  src={previewUrl}
                  alt="Article preview"
                  style={{
                    width: '100%',
                    maxHeight: 220,
                    objectFit: 'cover',
                    borderRadius: 12,
                    background: '#f8fafc',
                  }}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ marginTop: 10 }}
                  onClick={clearSelectedImage}
                >
                  <Trash2 size={14} />
                  Remove Image
                </button>
              </div>
            </div>
          ) : null}

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
              value={formData.description}
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
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : articleToEdit ? (
                'Update Article'
              ) : (
                'Create Article'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArticleModal;
