import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Trash2, Edit2, CheckCircle, XCircle, Eye } from 'lucide-react';
import { pickList } from '../../utils/api';
import { useApiData } from '../../hooks/useApiData';
import { pharmacyService } from '../../services/pharmacyService';
import './orders-page.css';

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
    <div className="orders-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders Management</h1>
          <p className="page-subtitle">Track and manage customer orders.</p>
        </div>
      </div>

      {(actionMessage || actionError) && (
        <div className={`message-box ${actionMessage ? 'message-success' : 'message-error'}`}>
          {actionMessage || actionError}
        </div>
      )}

      <div className="table-container">
        <div className="controls-bar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search orders..."
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
          <div className="loading-state">Loading orders...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <table className="orders-table">
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
                  <td colSpan="7" className="empty-state">No orders found.</td>
                </tr>
              ) : (
                filteredData.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <span className="order-id">#{order.orderNumber || order._id.slice(-6)}</span>
                    </td>
                    <td>
                      <div className="customer-info">
                        <span className="customer-name">{order.user?.userName || 'Guest'}</span>
                        <span className="customer-email">{order.user?.email || '-'}</span>
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
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="action-btn"
                          onClick={() => navigate(`/orders/${order._id}`)}
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="action-btn"
                          onClick={() => {
                            setSelectedOrder(order._id);
                            setStatusValue(order.status || 'pending');
                          }}
                          title="Update Status"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteOrder(order._id)}
                          title="Delete Order"
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

      {selectedOrder && (
        <div className="bulk-actions-bar">
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
