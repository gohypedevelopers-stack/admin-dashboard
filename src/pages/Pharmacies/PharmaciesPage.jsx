import React, { useMemo, useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Package, Edit, Trash2 } from 'lucide-react';
import { pickList } from '../../utils/api';
import { useApiData } from '../../hooks/useApiData';
import { pharmacyService } from '../../services/pharmacyService';
import ProductModal from '../../components/Pharmacies/ProductModal';
import './pharmacies-page.css';

const formatPrice = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
  return `Rs ${Number(value).toFixed(2)}`;
};

const PharmaciesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [refresh, setRefresh] = useState(0);

  const { data, loading, error } = useApiData(async () => {
    const payload = await pharmacyService.getAllProducts();
    const list =
      (payload && payload.data && Array.isArray(payload.data.items) && payload.data.items) ||
      pickList(payload);
    return Array.isArray(list) ? list : [];
  }, [refresh]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter(item =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await pharmacyService.deleteProduct(productId);
        setRefresh(prev => prev + 1);
      } catch (err) {
        alert('Failed to delete product: ' + err.message);
      }
    }
  };

  const handleModalSuccess = () => {
    setRefresh(prev => prev + 1);
  };

  return (
    <div className="pharmacies-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pharmacy Products</h1>
          <p className="page-subtitle">Manage your inventory and product listings.</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={handleAddProduct}>
            <Plus size={18} />
            Add Product
          </button>
        </div>
      </div>

      <div className="table-container">
        <div className="controls-bar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="action-btn">
            <Filter size={18} />
          </button>
        </div>

        {loading ? (
          <div className="loading-state">Loading products...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">No products found.</td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item._id || item.id}>
                    <td>
                      <div className="product-cell">
                        {item.images && item.images[0] ? (
                          <img src={item.images[0]} alt={item.name} className="product-image" />
                        ) : (
                          <div className="product-image-placeholder">
                            {item.name?.charAt(0) || <Package size={20} />}
                          </div>
                        )}
                        <div className="product-info">
                          <span className="product-name">{item.name}</span>
                          <span className="product-category">{item.manufacturer || 'Unknown Manufacturer'}</span>
                        </div>
                      </div>
                    </td>
                    <td>{item.category || '-'}</td>
                    <td>
                      <span className="price-tag">{formatPrice(item.price ?? item.mrp)}</span>
                    </td>
                    <td>
                      <span style={{ color: item.stock < 10 ? '#ef4444' : 'inherit', fontWeight: 500 }}>
                        {item.stock || 0} units
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${item.isPrescriptionRequired ? 'status-rx' :
                        item.stock > 0 ? 'status-active' : 'status-inactive'
                        }`}>
                        {item.isPrescriptionRequired ? 'Rx Required' :
                          item.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="action-btn"
                          onClick={() => handleEditProduct(item)}
                          title="Edit Product"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="action-btn"
                          onClick={() => handleDeleteProduct(item._id || item.id)}
                          title="Delete Product"
                          style={{ color: '#ef4444' }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default PharmaciesPage;
