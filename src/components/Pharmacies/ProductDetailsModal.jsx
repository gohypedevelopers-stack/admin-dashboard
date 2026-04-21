import React from 'react';
import { X, Package, ShieldCheck, IndianRupee, Boxes, BadgePercent, Calendar } from 'lucide-react';
import '../../styles/admin-panel.css';

const renderValue = (value, fallback = '-') => {
  if (value === null || value === undefined || value === '') return fallback;
  return value;
};

const ProductDetailsModal = ({ product, onClose }) => {
  if (!product) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 760 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Product Details</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'grid', gap: 20 }}>
          <div className="admin-panel-entity">
            <div className="admin-panel-avatar" style={{ width: 72, height: 72 }}>
              {product.images?.[0]?.url ? (
                <img
                  src={product.images[0].url}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16 }}
                />
              ) : (
                <Package size={28} />
              )}
            </div>
            <div>
              <span className="admin-panel-entity-title" style={{ fontSize: 22 }}>{product.name}</span>
              <span className="admin-panel-entity-subtitle">{product.brand || product.manufacturer || 'Unbranded product'}</span>
              <div style={{ marginTop: 10 }} className="admin-panel-actions">
                <span className="admin-panel-chip">{product.category || 'Uncategorized'}</span>
                {product.isPrescriptionRequired ? <span className="admin-panel-chip">Prescription Required</span> : null}
              </div>
            </div>
          </div>

          <div className="admin-info-grid">
            <div className="admin-info-card">
              <span className="admin-info-label"><IndianRupee size={12} /> Price</span>
              <div className="admin-info-value">₹{renderValue(product.price, 0)}</div>
            </div>
            <div className="admin-info-card">
              <span className="admin-info-label"><IndianRupee size={12} /> MRP</span>
              <div className="admin-info-value">₹{renderValue(product.mrp, '-')}</div>
            </div>
            <div className="admin-info-card">
              <span className="admin-info-label"><Boxes size={12} /> Stock</span>
              <div className="admin-info-value">{renderValue(product.stock, 0)}</div>
            </div>
            <div className="admin-info-card">
              <span className="admin-info-label"><ShieldCheck size={12} /> Status</span>
              <div className="admin-info-value">{renderValue(product.status, 'active')}</div>
            </div>
            <div className="admin-info-card">
              <span className="admin-info-label"><BadgePercent size={12} /> Discount</span>
              <div className="admin-info-value">{product.discountPercent ? `${product.discountPercent}%` : '-'}</div>
            </div>
            <div className="admin-info-card">
              <span className="admin-info-label"><Calendar size={12} /> Expiry</span>
              <div className="admin-info-value">{renderValue(product.expiry)}</div>
            </div>
          </div>

          <div className="admin-info-card">
            <span className="admin-info-label">Description</span>
            <div className="admin-info-value" style={{ fontWeight: 500, lineHeight: 1.6 }}>
              {renderValue(product.description, 'No description added for this product yet.')}
            </div>
          </div>

          {product.images?.length ? (
            <div className="admin-info-card">
              <span className="admin-info-label">Images</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
                {product.images.map((image, index) => (
                  <img
                    key={image.fileId || image.filename || index}
                    src={image.url || image.path}
                    alt={`${product.name}-${index + 1}`}
                    style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 14, background: '#f8fafc' }}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="modal-footer">
          <button className="btn-close" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
