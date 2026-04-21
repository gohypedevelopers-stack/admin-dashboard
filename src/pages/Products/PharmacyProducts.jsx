import React, { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  Grid,
  List,
  AlertTriangle,
  TrendingUp,
  ShoppingBag,
  Eye,
  Boxes,
} from 'lucide-react';
import { useApiData } from '../../hooks/useApiData';
import { pharmacyService } from '../../services/pharmacyService';
import { pickList } from '../../utils/api';
import ProductModal from '../../components/Pharmacies/ProductModal';
import ProductDetailsModal from '../../components/Pharmacies/ProductDetailsModal';
import './products-page.css';
import '../../styles/admin-panel.css';

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <div className={`product-stat-card ${color}`}>
    <div className="stat-icon-wrap">
      <Icon size={24} />
    </div>
    <div className="stat-content">
      <p className="stat-label">{title}</p>
      <h3 className="stat-number">{value}</h3>
      {subtitle && <p className="stat-sub">{subtitle}</p>}
    </div>
  </div>
);

const ProductCard = ({ product, onView, onEdit, onDelete }) => {
  const isLowStock = product.stock < 10;
  const isOutOfStock = product.stock === 0;

  return (
    <div className={`product-card ${isOutOfStock ? 'out-of-stock' : ''} ${isLowStock && !isOutOfStock ? 'low-stock' : ''}`}>
      <div className="product-card-image">
        {product.images && product.images[0]?.url ? (
          <img src={product.images[0].url} alt={product.name} />
        ) : (
          <div className="product-placeholder">
            <Package size={40} />
          </div>
        )}
        {isLowStock && !isOutOfStock && (
          <span className="stock-badge warning">
            <AlertTriangle size={12} /> Low Stock
          </span>
        )}
        {isOutOfStock && <span className="stock-badge danger">Out of Stock</span>}
        {product.isPrescriptionRequired && <span className="rx-badge">Rx</span>}
      </div>
      <div className="product-card-body">
        <span className="product-category-tag">{product.category || 'Uncategorized'}</span>
        <h4 className="product-card-title">{product.name}</h4>
        <p className="product-brand">{product.brand || product.manufacturer || 'Unknown Brand'}</p>
        <div className="product-card-footer">
          <div className="price-stock">
            <span className="product-price">₹{product.price?.toLocaleString() || 0}</span>
            <span className="product-stock">{product.stock || 0} in stock</span>
          </div>
          <div className="product-actions">
            <button className="icon-btn" onClick={() => onView(product)} title="View">
              <Eye size={16} />
            </button>
            <button className="icon-btn edit" onClick={() => onEdit(product)} title="Edit">
              <Edit2 size={16} />
            </button>
            <button className="icon-btn delete" onClick={() => onDelete(product._id)} title="Delete">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PharmacyProducts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data, loading, error } = useApiData(async () => {
    const payload = await pharmacyService.getAllProducts();
    return pickList(payload);
  }, [refreshKey]);

  const stats = useMemo(() => {
    if (!data) return { total: 0, lowStock: 0, outOfStock: 0, totalValue: 0 };
    const lowStock = data.filter((p) => p.stock < 10 && p.stock > 0).length;
    const outOfStock = data.filter((p) => p.stock === 0).length;
    const totalValue = data.reduce((sum, p) => sum + (p.price || 0) * (p.stock || 0), 0);
    return { total: data.length, lowStock, outOfStock, totalValue };
  }, [data]);

  const categories = useMemo(() => {
    if (!data) return ['All'];
    const cats = [...new Set(data.map((p) => p.category).filter(Boolean))];
    return ['All', ...cats.sort()];
  }, [data]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((product) => {
      const matchesSearch =
        (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.brand || product.manufacturer || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [data, searchTerm, selectedCategory]);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleViewProduct = (product) => {
    setViewProduct(product);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await pharmacyService.deleteProduct(productId);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Failed to delete product');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleModalSuccess = () => {
    handleModalClose();
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="products-page-v2 admin-panel-page">
      <div className="page-header-v2 admin-panel-hero">
        <div>
          <div className="admin-panel-kicker">
            <Boxes size={14} />
            Inventory Console
          </div>
          <h1 className="page-title-v2 admin-panel-title">Product Inventory</h1>
          <p className="page-subtitle-v2 admin-panel-subtitle">
            Manage all pharmacy products, preview details quickly, and keep stock and image updates in one cleaner workflow.
          </p>
        </div>
        <button className="btn-primary-v2 admin-panel-action" onClick={handleAddProduct}>
          <Plus size={20} />
          Add Product
        </button>
      </div>

      <div className="stats-row">
        <StatCard title="Total Products" value={stats.total.toLocaleString()} subtitle="In inventory" icon={Package} color="blue" />
        <StatCard title="Low Stock" value={stats.lowStock} subtitle="Need restocking" icon={AlertTriangle} color="amber" />
        <StatCard title="Out of Stock" value={stats.outOfStock} subtitle="Unavailable" icon={ShoppingBag} color="red" />
        <StatCard title="Inventory Value" value={`₹${stats.totalValue.toLocaleString()}`} subtitle="Total stock value" icon={TrendingUp} color="green" />
      </div>

      <div className="controls-bar-v2">
        <div className="search-box-v2">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search products by name or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select className="category-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <div className="view-toggle">
            <button className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Grid View">
              <Grid size={18} />
            </button>
            <button className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="List View">
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      <p className="results-count">
        Showing <strong>{filteredData.length}</strong> of <strong>{data?.length || 0}</strong> products
        {selectedCategory !== 'All' && <span> in <strong>{selectedCategory}</strong></span>}
      </p>

      {loading ? (
        <div className="loading-state-v2">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      ) : error ? (
        <div className="error-state-v2">{error}</div>
      ) : filteredData.length === 0 ? (
        <div className="empty-state-v2">
          <Package size={64} strokeWidth={1} />
          <h3>No products found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="products-grid">
          {filteredData.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onView={handleViewProduct}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          ))}
        </div>
      ) : (
        <div className="products-list">
          <table className="products-table-v2">
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
              {filteredData.map((product) => (
                <tr key={product._id} className={product.stock < 10 ? 'low-stock-row' : ''}>
                  <td>
                    <div className="product-cell-v2">
                      {product.images && product.images[0]?.url ? (
                        <img src={product.images[0].url} alt={product.name} className="product-thumb" />
                      ) : (
                        <div className="product-thumb-placeholder">
                          <Package size={20} />
                        </div>
                      )}
                      <div>
                        <span className="product-name-v2">{product.name}</span>
                        <span className="product-brand-v2">{product.brand || product.manufacturer}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className="category-pill">{product.category || '-'}</span></td>
                  <td className="price-cell">₹{product.price?.toLocaleString()}</td>
                  <td>
                    <span className={`stock-indicator ${product.stock === 0 ? 'out' : product.stock < 10 ? 'low' : 'ok'}`}>
                      {product.stock || 0}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge-v2 ${product.isPrescriptionRequired ? 'rx' : product.stock > 0 ? 'otc' : 'unavailable'}`}>
                      {product.isPrescriptionRequired ? 'Rx Required' : product.stock > 0 ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell-v2">
                      <button className="icon-btn" onClick={() => handleViewProduct(product)}>
                        <Eye size={16} />
                      </button>
                      <button className="icon-btn edit" onClick={() => handleEditProduct(product)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="icon-btn delete" onClick={() => handleDeleteProduct(product._id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProductModal isOpen={isModalOpen} onClose={handleModalClose} onSuccess={handleModalSuccess} product={selectedProduct} />
      <ProductDetailsModal product={viewProduct} onClose={() => setViewProduct(null)} />
    </div>
  );
};

export default PharmacyProducts;
