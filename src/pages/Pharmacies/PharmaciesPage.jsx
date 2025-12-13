import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Store, Phone, Mail, MapPin, Package, ShoppingBag, Eye } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import './pharmacies-page.css';

const PharmaciesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);

  const fetchPharmacies = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('/api/admin/pharmacies');
      if (response.success) {
        setPharmacies(response.data);
      } else {
        setError(response.message || 'Failed to fetch pharmacies');
      }
    } catch (err) {
      setError(err.message || 'Error loading pharmacies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const filteredData = useMemo(() => {
    if (!pharmacies) return [];
    return pharmacies.filter(item =>
      (item.storeName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.ownerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  }, [pharmacies, searchTerm]);

  return (
    <div className="pharmacies-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Registered Pharmacies</h1>
          <p className="page-subtitle">Monitor and manage all pharmacy partners.</p>
        </div>
      </div>

      <div className="table-container">
        <div className="controls-bar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by store, owner, email..."
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
          <div className="loading-state">Loading pharmacies...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>Pharmacy Details</th>
                <th>Contact Info</th>
                <th>Status</th>
                <th>Products</th>
                <th>Orders</th>
                <th>Date Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">No pharmacies found.</td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="product-cell">
                        <div className="product-image-placeholder" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                          <Store size={20} />
                        </div>
                        <div className="product-info">
                          <span className="product-name">{item.storeName}</span>
                          <span className="product-category">Owner: {item.ownerName}</span>
                          <span className="product-category" style={{ fontSize: '0.75rem', color: '#64748b' }}>License: {item.drugLicenseNumber}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Mail size={14} className="text-gray-400" />
                          <span>{item.email}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={14} className="text-gray-400" />
                          <span>{item.phoneNumber}</span>
                        </div>
                        {item.address?.city && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={14} className="text-gray-400" />
                            <span>{item.address.city}, {item.address.state}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${item.status === 'active' ? 'status-active' :
                          item.status === 'pending' ? 'status-rx' : 'status-inactive'
                        }`}>
                        {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Package size={16} className="text-slate-400" />
                        <span style={{ fontWeight: 500 }}>{item.productCount || 0}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShoppingBag size={16} className="text-slate-400" />
                        <span style={{ fontWeight: 500 }}>{item.orderCount || 0}</span>
                      </div>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.875rem' }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="action-btn"
                        onClick={() => navigate(`/pharmacies/${item._id}`)}
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PharmaciesPage;
