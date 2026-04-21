import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiRequest, pickList } from '../utils/api';

export const usePharmacyAdminData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pharmacies, setPharmacies] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [actionLoading, setActionLoading] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [pharmaciesRes, ordersRes, productsRes] = await Promise.all([
        apiRequest('/api/admin/pharmacies'),
        apiRequest('/api/admin/pharmacy/orders').catch(() => ({ data: [] })),
        apiRequest('/api/admin/pharmacy/products').catch(() => ({ data: [] })),
      ]);

      setPharmacies(pickList(pharmaciesRes));
      setOrders(pickList(ordersRes));
      setProducts(pickList(productsRes));
    } catch (err) {
      setError(err.message || 'Unable to load pharmacy admin data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = useCallback(async (pharmacyId, status) => {
    setActionLoading(pharmacyId);
    try {
      await apiRequest(`/api/admin/pharmacies/${pharmacyId}/status`, {
        method: 'PATCH',
        body: { status },
      });
      setPharmacies((prev) =>
        prev.map((item) => (item._id === pharmacyId ? { ...item, status } : item))
      );
    } finally {
      setActionLoading('');
    }
  }, []);

  const analytics = useMemo(() => {
    const pharmacyById = new Map(pharmacies.map((item) => [String(item._id), item]));
    const metrics = {};

    pharmacies.forEach((item) => {
      metrics[String(item._id)] = {
        pharmacyId: String(item._id),
        name: item.storeName || item.ownerName || 'Unnamed Pharmacy',
        status: item.status || 'pending',
        createdAt: item.createdAt,
        orders: 0,
        revenue: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        pendingOrders: 0,
        products: 0,
      };
    });

    orders.forEach((order) => {
      const pharmacyRef = order?.pharmacy?._id || order?.pharmacy;
      if (!pharmacyRef) return;
      const key = String(pharmacyRef);
      if (!metrics[key]) {
        const fallback = pharmacyById.get(key);
        metrics[key] = {
          pharmacyId: key,
          name:
            order?.pharmacy?.storeName ||
            fallback?.storeName ||
            fallback?.ownerName ||
            `Pharmacy #${key.slice(-6)}`,
          status: fallback?.status || 'unknown',
          createdAt: fallback?.createdAt,
          orders: 0,
          revenue: 0,
          deliveredOrders: 0,
          cancelledOrders: 0,
          pendingOrders: 0,
          products: 0,
        };
      }

      metrics[key].orders += 1;
      metrics[key].revenue += Number(order?.total || 0);

      if (['delivered', 'shipped', 'out_for_delivery'].includes(order?.status)) {
        metrics[key].deliveredOrders += 1;
      } else if (['cancelled', 'rejected'].includes(order?.status)) {
        metrics[key].cancelledOrders += 1;
      } else {
        metrics[key].pendingOrders += 1;
      }
    });

    products.forEach((product) => {
      const pharmacyRef =
        product?.pharmacy?._id || product?.pharmacy || product?.owner?._id || product?.owner;
      if (!pharmacyRef) return;
      const key = String(pharmacyRef);
      if (!metrics[key]) {
        const fallback = pharmacyById.get(key);
        metrics[key] = {
          pharmacyId: key,
          name: fallback?.storeName || fallback?.ownerName || `Pharmacy #${key.slice(-6)}`,
          status: fallback?.status || 'unknown',
          createdAt: fallback?.createdAt,
          orders: 0,
          revenue: 0,
          deliveredOrders: 0,
          cancelledOrders: 0,
          pendingOrders: 0,
          products: 0,
        };
      }
      metrics[key].products += 1;
    });

    const rows = Object.values(metrics).map((item) => ({
      ...item,
      averageOrderValue: item.orders ? item.revenue / item.orders : 0,
    }));

    return {
      rows,
      stats: {
        total: pharmacies.length,
        active: pharmacies.filter((item) => item.status === 'active').length,
        pending: pharmacies.filter((item) => item.status === 'pending').length,
        suspended: pharmacies.filter((item) => item.status === 'suspended').length,
      },
      topByOrders: [...rows].sort((a, b) => b.orders - a.orders).slice(0, 10),
      topByRevenue: [...rows].sort((a, b) => b.revenue - a.revenue).slice(0, 10),
    };
  }, [orders, pharmacies, products]);

  return {
    loading,
    error,
    pharmacies,
    orders,
    products,
    actionLoading,
    updateStatus,
    refresh: load,
    analytics,
  };
};
