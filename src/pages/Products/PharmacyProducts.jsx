import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Package } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData';
import { pharmacyService } from '../../services/pharmacyService';
import ProductModal from '../../components/Pharmacies/ProductModal';
import './products-page.css';

const PharmacyProducts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data, loading, error } = useApiData(async () => {
    const payload = await pharmacyService.getAllProducts();
    return Array.isArray(payload?.data) ? payload.data : [];
  }, [refreshKey]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter(product =>
      (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.manufacturer || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await pharmacyService.deleteProduct(productId);
        setRefreshKey(prev => prev + 1);
      } catch (err) {
        console.error('Failed to delete product:', err);
        alert('Failed to delete product');
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleModalSuccess = () => {
    handleModalClose();
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pharmacy Products</h1>
          <p className="page-subtitle">Manage your product inventory and pricing.</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={handleAddProduct}>
            <Plus size={20} />
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
                <th>Product Name</th>
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
                filteredData.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div className="product-info">
                        <div className="product-image-placeholder">
                          <Package size={20} color="#64748b" />
                        </div>
                        <div className="product-details">
                          <span className="product-name">{product.name}</span>
                          <span className="product-meta">{product.manufacturer}</span>
                        </div>
                      </div>
                    </td>
                    <td>{product.category || '-'}</td>
                    <td>₹{product.price}</td>
                    <td>{product.stock}</td>
                    <td>
                      <span className={`status-badge ${product.isPrescriptionRequired ? 'status-rx' : 'status-active'}`}>
                        {product.isPrescriptionRequired ? 'Rx Required' : 'OTC'}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          className="action-btn"
                          onClick={() => handleEditProduct(product)}
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteProduct(product._id)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
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
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        productToEdit={selectedProduct}
      />
    </div>
  );
};

export default PharmacyProducts;
