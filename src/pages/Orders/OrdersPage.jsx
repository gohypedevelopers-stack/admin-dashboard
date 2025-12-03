import React, { useMemo, useState } from 'react';
import AdminTable from '../../components/Common/AdminTable';
import { pickList } from '../../utils/api';
import { useApiData } from '../../hooks/useApiData';
import { pharmacyService } from '../../services/pharmacyService';

const COLUMNS = [
  { key: 'id', label: 'ID', type: 'text' },
  { key: 'orderNo', label: 'Order #', type: 'text' },
  { key: 'customer', label: 'Customer', type: 'text' },
  { key: 'total', label: 'Total', type: 'text' },
  { key: 'status', label: 'Status', type: 'text' },
  { key: 'payment', label: 'Payment', type: 'text' },
  { key: 'date', label: 'Date', type: 'date' },
];

const formatPrice = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
  return `Rs ${Number(value).toFixed(2)}`;
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toISOString().slice(0, 10);
};

const OrdersPage = () => {
  const [refresh, setRefresh] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [statusValue, setStatusValue] = useState('pending');
  const [paymentValue, setPaymentValue] = useState('pending');
  const [bulkSelection, setBulkSelection] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('pending');
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { data, loading, error } = useApiData(async () => {
    const payload = await pharmacyService.getAllOrders();
    const list = pickList(payload);
    return Array.isArray(list)
      ? list.map((item, idx) => ({
        id: item._id || item.id || idx + 1,
        orderNo: item.orderNumber || item._id || item.id || `ORD-${idx + 1}`,
        customer: item.user?.userName || item.shippingAddress?.fullName || '-',
        total: formatPrice(item.totalAmount ?? item.grandTotal ?? item.total),
        status: item.status || '-',
        payment: item.paymentStatus || '-',
        date: formatDate(item.createdAt || item.updatedAt),
      }))
      : [];
  }, [refresh]);

  const tableData = useMemo(() => data, [data]);

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
    } catch (err) {
      setActionError(err?.message || 'Unable to update order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;
    setDeleteLoading(true);
    clearMessages();
    try {
      await apiRequest(`/admin/pharmacy/orders/${selectedOrder}`, {
        method: 'DELETE',
      });
      setActionMessage('Order deleted successfully');
      setRefresh((prev) => prev + 1);
      setSelectedOrder('');
    } catch (err) {
      setActionError(err?.message || 'Unable to delete order');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBulkStatus = async () => {
    if (!bulkSelection.length) return;
    setActionLoading(true);
    clearMessages();
    try {
      await apiRequest('/admin/pharmacy/orders/bulk-update-status', {
        method: 'POST',
        body: { orderIds: bulkSelection, status: bulkStatus },
      });
      setActionMessage(`Updated ${bulkSelection.length} order(s).`);
      setBulkSelection([]);
      setRefresh((prev) => prev + 1);
    } catch (err) {
      setActionError(err?.message || 'Unable to update orders');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {error && (
        <div style={errorBoxStyle}>
          {error}
        </div>
      )}
      {loading ? (
        <div style={{ padding: '12px 0', color: '#475569' }}>Loading orders...</div>
      ) : (
        <AdminTable title="Orders Management" columns={COLUMNS} initialData={tableData} />
      )}
      {!loading && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ marginBottom: 12, fontSize: 18, color: '#0f172a' }}>Admin actions</h3>
          {actionMessage && <div style={actionMessageStyle(true)}>{actionMessage}</div>}
          {actionError && <div style={actionMessageStyle(false)}>{actionError}</div>}
          <div style={statusFormStyle}>
            <select value={selectedOrder} onChange={(e) => setSelectedOrder(e.target.value)} style={selectStyle}>
              <option value="">Select order</option>
              {tableData.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.orderNo}
                </option>
              ))}
            </select>
            <select value={statusValue} onChange={(e) => setStatusValue(e.target.value)} style={selectStyle}>
              {['pending', 'processing', 'confirmed', 'delivered', 'cancelled'].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <select value={paymentValue} onChange={(e) => setPaymentValue(e.target.value)} style={selectStyle}>
              {['pending', 'paid', 'failed', 'refunded'].map((payment) => (
                <option key={payment} value={payment}>
                  {payment}
                </option>
              ))}
            </select>
            <button onClick={handleUpdateStatus} style={actionButtonStyle} disabled={actionLoading}>
              {actionLoading ? 'Updating…' : 'Update'}
            </button>
            <button onClick={handleDeleteOrder} style={deleteButtonStyle} disabled={deleteLoading || !selectedOrder}>
              {deleteLoading ? 'Deleting…' : 'Delete order'}
            </button>
          </div>
          <div style={{ marginTop: 16, borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
            <label htmlFor="bulk-select" style={{ fontWeight: 600, color: '#475569' }}>
              Bulk status update (Ctrl/Cmd + click to select multiple)
            </label>
            <select
              id="bulk-select"
              multiple
              size={4}
              style={bulkSelectStyle}
              value={bulkSelection}
              onChange={(event) =>
                setBulkSelection(Array.from(event.target.selectedOptions, (opt) => opt.value))
              }
            >
              {tableData.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.orderNo} — {order.customer}
                </option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
              <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} style={selectStyle}>
                {['pending', 'processing', 'confirmed', 'delivered', 'cancelled'].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <button
                onClick={handleBulkStatus}
                style={actionButtonStyle}
                disabled={actionLoading || !bulkSelection.length}
              >
                {actionLoading ? 'Updating…' : 'Update selected'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const errorBoxStyle = {
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid #fecaca',
  background: '#fee2e2',
  color: '#991b1b',
  marginBottom: 12,
  fontSize: 14,
};

const statusFormStyle = {
  display: 'flex',
  gap: 12,
  flexWrap: 'wrap',
  alignItems: 'center',
};

const selectStyle = {
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid #cbd5e1',
  background: '#fff',
  fontFamily: 'inherit',
};

const actionButtonStyle = {
  padding: '8px 14px',
  borderRadius: 8,
  border: 'none',
  background: '#0ea5e9',
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
};

const deleteButtonStyle = {
  ...actionButtonStyle,
  background: '#dc2626',
};

const actionMessageStyle = (success) => ({
  marginBottom: 12,
  padding: '10px 12px',
  borderRadius: 8,
  fontSize: 13,
  background: success ? '#dcfce7' : '#fee2e2',
  color: success ? '#166534' : '#991b1b',
});

const bulkSelectStyle = {
  ...selectStyle,
  width: '100%',
};

export default OrdersPage;
