import React, { useCallback, useMemo, useState } from 'react';
import AdminTable from '../../components/Common/AdminTable';
import { apiRequest, pickList } from '../../utils/api';
import { useApiData } from '../../hooks/useApiData';

const COLUMNS = [
  { key: 'id', label: 'ID', type: 'text' },
  { key: 'name', label: 'Product', type: 'text' },
  { key: 'price', label: 'Price', type: 'text' },
  { key: 'stock', label: 'Stock', type: 'text' },
  { key: 'status', label: 'Status', type: 'text' },
];

const formatPrice = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
  return `Rs ${Number(value).toFixed(2)}`;
};

const PharmacyProducts = () => {
  const [refresh, setRefresh] = useState(0);
  const { data, loading, error } = useApiData(async () => {
    const payload = await apiRequest('/api/pharmacy/products');
    const list = pickList(payload);
    return list.map((item, idx) => ({
      id: item._id || item.id || idx + 1,
      name: item.name || '-',
      price: formatPrice(item.price ?? item.mrp),
      stock: item.stock ?? '-',
      status: item.status || (item.isPrescriptionRequired ? 'Requires Rx' : 'Active'),
      raw: item
    }));
  }, [refresh]);

  const archiveProduct = useCallback(async (productId) => {
    if (!productId) return;
    await apiRequest(`/api/pharmacy/products/${productId}`, { method: 'DELETE' });
    setRefresh((prev) => prev + 1);
  }, []);

  const tableData = useMemo(() => data, [data]);

  return (
    <div style={{ padding: '20px' }}>
      {error && (
        <div style={errorBoxStyle}>
          {error}
        </div>
      )}
      {loading ? (
        <div style={{ padding: '12px 0', color: '#475569' }}>Loading products...</div>
      ) : (
        <>
          <AdminTable
            title="Products Management"
            columns={COLUMNS}
            initialData={tableData}
          />
          <div style={{ marginTop: 20 }}>
            <h3 style={{ marginBottom: 12, fontSize: 18, color: '#0f172a' }}>Admin Actions</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              {tableData.map((item) => (
                <div key={`action-${item.id}`} style={actionCardStyle}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600 }}>{item.name}</p>
                    <p style={{ margin: '4px 0', color: '#475569' }}>Status: {item.status}</p>
                  </div>
                  <button
                    onClick={() => archiveProduct(item.raw._id || item.raw.id)}
                    style={actionButtonStyle}
                  >
                    Archive
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
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
  fontSize: 14
};

const actionCardStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid #e2e8f0',
  background: '#fff',
  boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)'
};

const actionButtonStyle = {
  padding: '6px 12px',
  borderRadius: 8,
  border: 'none',
  background: '#dc2626',
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer'
};

export default PharmacyProducts;
