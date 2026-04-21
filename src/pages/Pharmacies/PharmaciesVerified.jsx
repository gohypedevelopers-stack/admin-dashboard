import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, PauseCircle, ShoppingBag, ShieldCheck, Store } from 'lucide-react';
import '../../styles/admin-panel.css';
import { usePharmacyAdminData } from '../../hooks/usePharmacyAdminData';

const PharmaciesVerified = () => {
  const navigate = useNavigate();
  const { loading, error, actionLoading, updateStatus, analytics } = usePharmacyAdminData();
  const verified = useMemo(
    () => analytics.rows.filter((item) => item.status === 'active'),
    [analytics.rows]
  );

  return (
    <div className="admin-panel-page">
      <div className="admin-panel-hero">
        <div>
          <div className="admin-panel-kicker">
            <ShieldCheck size={14} />
            Pharmacy Verification
          </div>
          <h1 className="admin-panel-title">Verified Pharmacies</h1>
          <p className="admin-panel-subtitle">
            Active pharmacy accounts that can access the pharmacy dashboard and accept orders.
          </p>
        </div>
      </div>

      <div className="admin-panel-stats">
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Verified</p>
          <div className="admin-panel-stat-value">{verified.length}</div>
          <p className="admin-panel-stat-note">Approved by admin</p>
        </div>
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Orders</p>
          <div className="admin-panel-stat-value">
            {verified.reduce((sum, item) => sum + item.orders, 0)}
          </div>
          <p className="admin-panel-stat-note">Handled by active stores</p>
        </div>
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Revenue</p>
          <div className="admin-panel-stat-value">
            Rs {Math.round(verified.reduce((sum, item) => sum + item.revenue, 0)).toLocaleString()}
          </div>
          <p className="admin-panel-stat-note">Gross pharmacy order value</p>
        </div>
      </div>

      <div className="table-container admin-panel-card">
        {loading ? (
          <div className="loading-state">Loading verified pharmacies...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <table className="products-table admin-panel-table">
            <thead>
              <tr>
                <th>Pharmacy</th>
                <th>Products</th>
                <th>Orders</th>
                <th>Revenue</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {verified.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">No verified pharmacies yet.</td>
                </tr>
              ) : (
                verified.map((item) => (
                  <tr key={item.pharmacyId}>
                    <td>
                      <div className="product-cell">
                        <div className="product-image-placeholder" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                          <Store size={20} />
                        </div>
                        <div className="product-info">
                          <span className="product-name">{item.name}</span>
                          <span className="product-category">Status: Active</span>
                        </div>
                      </div>
                    </td>
                    <td>{item.products}</td>
                    <td>{item.orders}</td>
                    <td>Rs {Math.round(item.revenue).toLocaleString()}</td>
                    <td>
                      <div className="admin-panel-actions">
                        <button className="admin-action-button" onClick={() => navigate(`/pharmacies/${item.pharmacyId}`)}>
                          <Eye size={16} />
                          View
                        </button>
                        <button
                          className="admin-action-button danger"
                          onClick={() => updateStatus(item.pharmacyId, 'suspended')}
                          disabled={actionLoading === item.pharmacyId}
                        >
                          <PauseCircle size={16} />
                          Suspend
                        </button>
                        <button className="admin-action-button secondary" onClick={() => navigate('/orders')}>
                          <ShoppingBag size={16} />
                          Orders
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
    </div>
  );
};

export default PharmaciesVerified;
