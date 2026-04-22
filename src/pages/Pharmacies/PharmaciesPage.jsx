import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Store, Phone, Mail, MapPin, Package, ShoppingBag, Eye, ShieldCheck, PauseCircle, Clock3 } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import './pharmacies-page.css';
import '../../styles/admin-panel.css';

const PharmaciesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [actionLoading, setActionLoading] = useState('');

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

  const updateStatus = async (pharmacyId, status) => {
    try {
      const reason = window.prompt(`Add a reason for setting this pharmacy to ${status} (optional):`, '') ?? '';
      setActionLoading(pharmacyId);
      await apiRequest(`/api/admin/pharmacies/${pharmacyId}/status`, {
        method: 'PATCH',
        body: { status, reason },
      });
      setPharmacies((prev) =>
        prev.map((item) =>
          item._id === pharmacyId
            ? { ...item, status, statusReason: reason || item.statusReason }
            : item
        )
      );
    } catch (err) {
      alert(err.message || 'Unable to update pharmacy status');
    } finally {
      setActionLoading('');
    }
  };

  const stats = useMemo(() => ({
    total: pharmacies.length,
    pending: pharmacies.filter((item) => item.status === 'pending').length,
    active: pharmacies.filter((item) => item.status === 'active').length,
    suspended: pharmacies.filter((item) => item.status === 'suspended').length,
  }), [pharmacies]);

  const filteredData = useMemo(() => {
    if (!pharmacies) return [];
    return pharmacies.filter(item =>
      (item.storeName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.ownerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  }, [pharmacies, searchTerm]);

  return (
    <div className="pharmacies-page admin-panel-page">
      <div className="admin-panel-hero page-header">
        <div>
          <div className="admin-panel-kicker">
            <Store size={14} />
            Pharmacy Control
          </div>
          <h1 className="page-title admin-panel-title">Registered Pharmacies</h1>
          <p className="page-subtitle admin-panel-subtitle">Review new pharmacy leads, approve access to the pharmacy dashboard, or keep accounts pending until admin verification is complete.</p>
        </div>
      </div>

      <div className="admin-panel-stats">
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">All Pharmacies</p>
          <div className="admin-panel-stat-value">{stats.total}</div>
          <p className="admin-panel-stat-note">Registered in platform</p>
        </div>
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Pending</p>
          <div className="admin-panel-stat-value">{stats.pending}</div>
          <p className="admin-panel-stat-note">Waiting for approval</p>
        </div>
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Active</p>
          <div className="admin-panel-stat-value">{stats.active}</div>
          <p className="admin-panel-stat-note">Can use pharmacy dashboard</p>
        </div>
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Suspended</p>
          <div className="admin-panel-stat-value">{stats.suspended}</div>
          <p className="admin-panel-stat-note">Access blocked by admin</p>
        </div>
      </div>

      <div className="table-container admin-panel-card">
        <div className="controls-bar admin-panel-toolbar">
          <div className="search-box admin-panel-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by store, owner, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="admin-panel-toolbar-meta">
            <span className="admin-panel-chip">
              <Clock3 size={14} />
              {filteredData.length} visible
            </span>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading pharmacies...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <table className="products-table admin-panel-table">
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
                           {item.statusReason && (
                             <span className="product-category" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                               Note: {item.statusReason}
                             </span>
                           )}
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
                      <div className="admin-panel-actions">
                        <button
                          className="admin-action-button"
                          onClick={() => navigate(`/pharmacies/${item._id}`)}
                          title="View Details"
                        >
                          <Eye size={16} />
                          View
                        </button>
                        {item.status !== 'active' && (
                          <button
                            className="admin-action-button success"
                            onClick={() => updateStatus(item._id, 'active')}
                            disabled={actionLoading === item._id}
                          >
                            <ShieldCheck size={16} />
                            Approve
                          </button>
                        )}
                        {item.status !== 'suspended' && (
                          <button
                            className="admin-action-button danger"
                            onClick={() => updateStatus(item._id, 'suspended')}
                            disabled={actionLoading === item._id}
                          >
                            <PauseCircle size={16} />
                            Suspend
                          </button>
                        )}
                        {item.status !== 'pending' && (
                          <button
                            className="admin-action-button secondary"
                            onClick={() => updateStatus(item._id, 'pending')}
                            disabled={actionLoading === item._id}
                          >
                            <Clock3 size={16} />
                            Set Pending
                          </button>
                        )}
                      </div>
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
