import React from 'react';
import { Clock3, PauseCircle, ShieldCheck, Store } from 'lucide-react';
import '../../styles/admin-panel.css';
import { usePharmacyAdminData } from '../../hooks/usePharmacyAdminData';

const statusMeta = {
  active: { label: 'Active', icon: ShieldCheck, tone: 'success' },
  pending: { label: 'Pending', icon: Clock3, tone: 'secondary' },
  suspended: { label: 'Suspended', icon: PauseCircle, tone: 'danger' },
};

const PharmaciesStatus = () => {
  const { loading, error, analytics, actionLoading, updateStatus } = usePharmacyAdminData();

  return (
    <div className="admin-panel-page">
      <div className="admin-panel-hero">
        <div>
          <div className="admin-panel-kicker">
            <Store size={14} />
            Status Control
          </div>
          <h1 className="admin-panel-title">Pharmacy Status Management</h1>
          <p className="admin-panel-subtitle">
            Change pharmacy access state directly from one control surface.
          </p>
        </div>
      </div>

      <div className="admin-panel-stats">
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Total</p>
          <div className="admin-panel-stat-value">{analytics.stats.total}</div>
        </div>
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Active</p>
          <div className="admin-panel-stat-value">{analytics.stats.active}</div>
        </div>
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Pending</p>
          <div className="admin-panel-stat-value">{analytics.stats.pending}</div>
        </div>
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Suspended</p>
          <div className="admin-panel-stat-value">{analytics.stats.suspended}</div>
        </div>
      </div>

      <div className="table-container admin-panel-card">
        {loading ? (
          <div className="loading-state">Loading statuses...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <table className="products-table admin-panel-table">
            <thead>
              <tr>
                <th>Pharmacy</th>
                <th>Current Status</th>
                <th>Orders</th>
                <th>Revenue</th>
                <th>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {analytics.rows.map((item) => {
                const current = statusMeta[item.status] || statusMeta.pending;
                const StatusIcon = current.icon;
                return (
                  <tr key={item.pharmacyId}>
                    <td>{item.name}</td>
                    <td>
                      <span className={`status-badge status-${current.tone === 'success' ? 'active' : current.tone === 'danger' ? 'inactive' : 'rx'}`}>
                        <StatusIcon size={14} />
                        {current.label}
                      </span>
                    </td>
                    <td>{item.orders}</td>
                    <td>Rs {Math.round(item.revenue).toLocaleString()}</td>
                    <td>
                      <div className="admin-panel-actions">
                        {item.status !== 'active' && (
                          <button
                            className="admin-action-button success"
                            onClick={() => updateStatus(item.pharmacyId, 'active')}
                            disabled={actionLoading === item.pharmacyId}
                          >
                            <ShieldCheck size={16} />
                            Approve
                          </button>
                        )}
                        {item.status !== 'pending' && (
                          <button
                            className="admin-action-button secondary"
                            onClick={() => updateStatus(item.pharmacyId, 'pending')}
                            disabled={actionLoading === item.pharmacyId}
                          >
                            <Clock3 size={16} />
                            Pending
                          </button>
                        )}
                        {item.status !== 'suspended' && (
                          <button
                            className="admin-action-button danger"
                            onClick={() => updateStatus(item.pharmacyId, 'suspended')}
                            disabled={actionLoading === item.pharmacyId}
                          >
                            <PauseCircle size={16} />
                            Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PharmaciesStatus;
