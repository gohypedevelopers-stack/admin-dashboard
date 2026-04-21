import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Trash2, Edit2, Eye, PackageCheck, Truck, BadgeIndianRupee, ClipboardList } from 'lucide-react';
import { pickList } from '../../utils/api';
import { useApiData } from '../../hooks/useApiData';
import { pharmacyService } from '../../services/pharmacyService';
import './orders-page.css';
import '../../styles/admin-panel.css';

const formatPrice = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
  return `Rs ${Number(value).toFixed(2)}`;
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
};

const OrdersPage = () => {
  const navigate = useNavigate();
  const [refresh, setRefresh] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState('');
  const [statusValue, setStatusValue] = useState('pending');
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const { data, loading, error } = useApiData(async () => {
    const payload = await pharmacyService.getAllOrders();
    const list = pickList(payload);
    return Array.isArray(list) ? list : [];
  }, [refresh]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter(item =>
      item.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.user?.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item._id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const stats = useMemo(() => {
    const source = data || [];
    return {
      total: source.length,
      pending: source.filter((item) => (item.status || 'pending') === 'pending').length,
      delivered: source.filter((item) => (item.status || '').toLowerCase() === 'delivered').length,
      revenue: source.reduce((sum, item) => sum + Number(item.totalAmount ?? item.grandTotal ?? 0), 0),
    };
  }, [data]);

  const clearMessages = () => {
    setActionMessage('');
    setActionError('');
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setActionLoading(true);
    clearMessages();
    try {
      await pharmacyService.updateOrderStatus(selectedOrder, statusValue);
      setActionMessage('Order updated successfully');
      setRefresh((prev) => prev + 1);
      setSelectedOrder('');
    } catch (err) {
      setActionError(err?.message || 'Unable to update order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    setActionLoading(true);
    clearMessages();
    try {
      await pharmacyService.deleteOrder(orderId);
      setActionMessage('Order deleted successfully');
      setRefresh((prev) => prev + 1);
    } catch (err) {
      setActionError(err?.message || 'Unable to delete order');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="admin-panel-page orders-page">
      <div className="admin-panel-hero">
        <div>
          <div className="admin-panel-kicker">
            <ClipboardList size={14} />
            Orders Control
          </div>
          <h1 className="admin-panel-title">Orders Management</h1>
          <p className="admin-panel-subtitle">Track customer orders, jump into details quickly, and update delivery status without leaving the page.</p>
        </div>
      </div>

      <div className="admin-panel-stats">
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Total Orders</p>
          <div className="admin-panel-stat-value">{stats.total}</div>
          <p className="admin-panel-stat-note">Across all pharmacies</p>
        </div>
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Pending</p>
          <div className="admin-panel-stat-value">{stats.pending}</div>
          <p className="admin-panel-stat-note">Needs action from operations</p>
        </div>
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Delivered</p>
          <div className="admin-panel-stat-value">{stats.delivered}</div>
          <p className="admin-panel-stat-note">Closed successfully</p>
        </div>
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Revenue</p>
          <div className="admin-panel-stat-value">₹{Math.round(stats.revenue).toLocaleString()}</div>
          <p className="admin-panel-stat-note">Visible order value</p>
        </div>
      </div>

      {(actionMessage || actionError) && (
        <div className={`message-box ${actionMessage ? 'message-success' : 'message-error'}`}>
          {actionMessage || actionError}
        </div>
      )}

      <div className="admin-panel-card table-container">
        <div className="admin-panel-toolbar controls-bar">
          <div className="admin-panel-search search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="admin-panel-toolbar-meta">
            <span className="admin-panel-chip">
              <PackageCheck size={14} />
              {filteredData.length} visible
            </span>
          </div>
        </div>

        {loading ? (
          <div className="admin-panel-empty loading-state">Loading orders...</div>
        ) : error ? (
          <div className="admin-panel-empty error-state">{error}</div>
        ) : (
          <table className="admin-panel-table orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="admin-panel-empty empty-state">No orders found.</td>
                </tr>
              ) : (
                filteredData.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <span className="order-id">#{order.orderNumber || order._id.slice(-6)}</span>
                    </td>
                    <td>
                      <div className="admin-panel-entity customer-info">
                        <div className="admin-panel-avatar">
                          {(order.user?.userName || 'G').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="admin-panel-entity-title customer-name">{order.user?.userName || 'Guest'}</span>
                          <span className="admin-panel-entity-subtitle customer-email">{order.user?.email || '-'}</span>
                        </div>
                      </div>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{formatPrice(order.totalAmount ?? order.grandTotal)}</td>
                    <td>
                      <span className={`payment-badge payment-${(order.paymentStatus || 'pending').toLowerCase()}`}>
                        {order.paymentStatus || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${(order.status || 'pending').toLowerCase()}`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-panel-actions">
                        <button
                          className="admin-action-button"
                          onClick={() => navigate(`/orders/${order._id}`)}
                          title="View Details"
                        >
                          <Eye size={16} />
                          View
                        </button>
                        <button
                          className="admin-action-button secondary"
                          onClick={() => {
                            setSelectedOrder(order._id);
                            setStatusValue(order.status || 'pending');
                          }}
                          title="Update Status"
                        >
                          <Edit2 size={16} />
                          Edit
                        </button>
                        <button
                          className="admin-action-button danger"
                          onClick={() => handleDeleteOrder(order._id)}
                          title="Delete Order"
                        >
                          <Trash2 size={16} />
                          Delete
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

      {selectedOrder && (
        <div className="admin-panel-drawer bulk-actions-bar">
          <div className="bulk-header">Update Status for Selected Order</div>
          <div className="bulk-controls">
            <select
              className="select-input"
              value={statusValue}
              onChange={(e) => setStatusValue(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              className="btn-action"
              onClick={handleUpdateStatus}
              disabled={actionLoading}
            >
              {actionLoading ? 'Updating...' : 'Update Status'}
            </button>
            <button
              className="btn-action"
              style={{ background: '#64748b' }}
              onClick={() => setSelectedOrder('')}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
