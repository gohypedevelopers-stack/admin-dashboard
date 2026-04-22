import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock3, Eye, PauseCircle, ShieldCheck, Store } from 'lucide-react';
import '../../styles/admin-panel.css';
import { usePharmacyAdminData } from '../../hooks/usePharmacyAdminData';

const promptStatusReason = (status) =>
  window.prompt(`Add a reason for setting this pharmacy to ${status} (optional):`, '') ?? '';

const PharmaciesNewVerification = () => {
  const navigate = useNavigate();
  const { loading, error, actionLoading, updateStatus, analytics } = usePharmacyAdminData();
  const pending = useMemo(
    () => analytics.rows.filter((item) => item.status === 'pending'),
    [analytics.rows]
  );

  return (
    <div className="admin-panel-page">
      <div className="admin-panel-hero">
        <div>
          <div className="admin-panel-kicker">
            <Clock3 size={14} />
            Pharmacy Leads
          </div>
          <h1 className="admin-panel-title">New Pharmacy Verification</h1>
          <p className="admin-panel-subtitle">
            Review newly registered pharmacy accounts before allowing dashboard access.
          </p>
        </div>
      </div>

      <div className="admin-panel-stats">
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Pending</p>
          <div className="admin-panel-stat-value">{pending.length}</div>
          <p className="admin-panel-stat-note">Need admin decision</p>
        </div>
      </div>

      <div className="table-container admin-panel-card">
        {loading ? (
          <div className="loading-state">Loading pending pharmacy accounts...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <table className="products-table admin-panel-table">
            <thead>
              <tr>
                <th>Pharmacy</th>
                <th>Products</th>
                <th>Orders</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pending.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">No pending pharmacy verification requests.</td>
                </tr>
              ) : (
                pending.map((item) => (
                  <tr key={item.pharmacyId}>
                    <td>
                      <div className="product-cell">
                        <div className="product-image-placeholder" style={{ background: '#fef3c7', color: '#b45309' }}>
                          <Store size={20} />
                        </div>
                        <div className="product-info">
                          <span className="product-name">{item.name}</span>
                          <span className="product-category">Status: Pending</span>
                        </div>
                      </div>
                    </td>
                    <td>{item.products}</td>
                    <td>{item.orders}</td>
                    <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</td>
                    <td>
                      <div className="admin-panel-actions">
                        <button className="admin-action-button" onClick={() => navigate(`/pharmacies/${item.pharmacyId}`)}>
                          <Eye size={16} />
                          View
                        </button>
                        <button
                          className="admin-action-button success"
                          onClick={() =>
                            updateStatus(item.pharmacyId, 'active', promptStatusReason('active'))
                          }
                          disabled={actionLoading === item.pharmacyId}
                        >
                          <ShieldCheck size={16} />
                          Approve
                        </button>
                        <button
                          className="admin-action-button danger"
                          onClick={() =>
                            updateStatus(item.pharmacyId, 'suspended', promptStatusReason('suspended'))
                          }
                          disabled={actionLoading === item.pharmacyId}
                        >
                          <PauseCircle size={16} />
                          Suspend
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

export default PharmaciesNewVerification;
