import React, { useMemo } from 'react';
import AdminTable from '../../components/Common/AdminTable';
import { pickList } from '../../utils/api';
import { useApiData } from '../../hooks/useApiData';
import { pharmacyService } from '../../services/pharmacyService';

const COLUMNS = [
  { key: 'id', label: 'ID', type: 'text' },
  { key: 'name', label: 'Product / Pharmacy', type: 'text' },
  { key: 'category', label: 'Category', type: 'text' },
  { key: 'price', label: 'Price', type: 'text' },
  { key: 'status', label: 'Status', type: 'text' },
];

const formatPrice = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
  return `Rs ${Number(value).toFixed(2)}`;
};

const PharmaciesPage = () => {
  const { data, loading, error } = useApiData(async () => {
    const payload = await pharmacyService.getAllProducts();
    const list =
      (payload && payload.data && Array.isArray(payload.data.items) && payload.data.items) ||
      pickList(payload);
    return Array.isArray(list)
      ? list.map((item, idx) => ({
        id: item._id || item.id || idx + 1,
        name: item.name || '-',
        category: item.category || '-',
        price: formatPrice(item.price ?? item.mrp),
        status: item.status || (item.isPrescriptionRequired ? 'Requires Rx' : 'Active')
      }))
      : [];
  }, []);

  const tableData = useMemo(() => data, [data]);

  return (
    <div style={{ padding: '20px' }}>
      {error && <div style={errorStyle}>{error}</div>}
      {loading ? (
        <div style={{ color: '#475569', padding: '12px 0' }}>Loading pharmacy data...</div>
      ) : (
        <AdminTable title="Pharmacies Management" columns={COLUMNS} initialData={tableData} />
      )}
    </div>
  );
};

const errorStyle = {
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid #fecaca',
  background: '#fee2e2',
  color: '#991b1b',
  marginBottom: 12,
  fontSize: 14
};

export default PharmaciesPage;
