import { useCallback, useEffect, useRef, useState } from 'react';
import { apiRequest } from '../utils/api';

const DASHBOARD_ENDPOINTS = {
  overview: '/api/admin/dashboard/stats',
  verifications: '/api/admin/verifications?type=doctor&limit=5&page=1',
  topDoctors: '/api/admin/doctors/top?limit=5',
  // Pharmacy endpoints
  pharmacyOrders: '/api/admin/pharmacy/orders',
  pharmacyProducts: '/api/admin/pharmacy/products',
  pharmacyUsers: '/api/admin/users?role=pharmacy',
};

export const useDashboardData = () => {
  const isMounted = useRef(true);
  const [overview, setOverview] = useState(null);
  const [verifications, setVerifications] = useState([]);

  const [topDoctorsByAppointments, setTopDoctorsByAppointments] = useState([]);
  const [topDoctorsByRevenue, setTopDoctorsByRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pharmacy data states
  const [pharmacyStats, setPharmacyStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
  });
  const [productStats, setProductStats] = useState({
    total: 0,
    lowStock: 0,
    categories: [],
  });
  const [orderStats, setOrderStats] = useState({
    total: 0,
    byStatus: {},
    totalRevenue: 0,
    recentOrders: [],
  });
  const [topPharmacies, setTopPharmacies] = useState({
    byOrders: [],
    byRevenue: [],
  });

  const loadDashboard = useCallback(async () => {
    if (!isMounted.current) return;
    setLoading(true);
    setError('');

    try {
      const [overviewRes, verifsRes, topDoctorsRes, ordersRes, productsRes, pharmacyUsersRes] = await Promise.all([
        apiRequest(DASHBOARD_ENDPOINTS.overview),
        apiRequest(DASHBOARD_ENDPOINTS.verifications),
        apiRequest(DASHBOARD_ENDPOINTS.topDoctors),
        apiRequest(DASHBOARD_ENDPOINTS.pharmacyOrders).catch(() => ({ data: { items: [] } })),
        apiRequest(DASHBOARD_ENDPOINTS.pharmacyProducts).catch(() => ({ data: { items: [] } })),
        apiRequest(DASHBOARD_ENDPOINTS.pharmacyUsers).catch(() => ({ data: { users: [] } })),
      ]);

      if (!isMounted.current) return;

      setOverview(overviewRes?.data ?? null);
      setVerifications(verifsRes?.data?.verifications ?? []);
      setTopDoctorsByAppointments(topDoctorsRes?.data?.byAppointments ?? []);
      setTopDoctorsByRevenue(topDoctorsRes?.data?.byRevenue ?? []);

      // Process pharmacy users
      const pharmacyUsers = pharmacyUsersRes?.data?.users ?? [];
      const activePharmacies = pharmacyUsers.filter(p => p.status === 'active' || !p.status).length;
      const pendingPharmacies = pharmacyUsers.filter(p => p.status === 'pending').length;
      const suspendedPharmacies = pharmacyUsers.filter(p => p.status === 'suspended').length;
      setPharmacyStats({
        total: pharmacyUsers.length,
        active: activePharmacies || pharmacyUsers.length,
        pending: pendingPharmacies,
        suspended: suspendedPharmacies,
      });

      // Process products
      const products = productsRes?.data?.items ?? productsRes?.data ?? [];
      const productList = Array.isArray(products) ? products : [];
      const lowStockProducts = productList.filter(p => p.stock !== undefined && p.stock < 10);
      const categoryMap = {};
      productList.forEach(p => {
        if (p.category) {
          categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
        }
      });
      setProductStats({
        total: productList.length,
        lowStock: lowStockProducts.length,
        categories: Object.entries(categoryMap).map(([name, count]) => ({ name, count })),
      });

      // Process orders
      const orders = ordersRes?.data?.items ?? ordersRes?.data ?? [];
      const orderList = Array.isArray(orders) ? orders : [];
      const statusCounts = {};
      let totalRevenue = 0;
      const pharmacyNames = {};
      const pharmacyOrderCounts = {};
      const pharmacyRevenueTotals = {};

      orderList.forEach(order => {
        // Count by status
        const status = order.status || 'unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;

        // Calculate revenue from delivered orders
        if (['delivered', 'shipped', 'out_for_delivery'].includes(order.status)) {
          totalRevenue += order.total || 0;
        }

        // Track pharmacy stats
        const pharmacyObj = order.pharmacy;
        const pharmacyId = pharmacyObj?._id || pharmacyObj || 'unknown';

        // Extract name if available, otherwise fallback is handled in UI or here
        if (pharmacyObj?.storeName) {
          pharmacyNames[pharmacyId] = pharmacyObj.storeName;
        }

        pharmacyOrderCounts[pharmacyId] = (pharmacyOrderCounts[pharmacyId] || 0) + 1;
        pharmacyRevenueTotals[pharmacyId] = (pharmacyRevenueTotals[pharmacyId] || 0) + (order.total || 0);
      });

      // Top 5 pharmacies by orders and revenue
      const sortedByOrders = Object.entries(pharmacyOrderCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id, count]) => ({
          pharmacyId: id,
          name: pharmacyNames[id] || `Pharmacy #${id.slice(-6)}`,
          orderCount: count
        }));

      const sortedByRevenue = Object.entries(pharmacyRevenueTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id, revenue]) => ({
          pharmacyId: id,
          name: pharmacyNames[id] || `Pharmacy #${id.slice(-6)}`,
          revenue
        }));

      setOrderStats({
        total: orderList.length,
        byStatus: statusCounts,
        totalRevenue,
        recentOrders: orderList.slice(0, 5).map(o => ({
          _id: o._id,
          customerName: o.user?.userName || o.shippingAddress?.fullName || 'Unknown',
          total: o.total,
          status: o.status,
          createdAt: o.createdAt,
        })),
      });

      setTopPharmacies({
        byOrders: sortedByOrders,
        byRevenue: sortedByRevenue,
      });

    } catch (err) {
      if (!isMounted.current) return;
      setError(err?.message || 'Unable to load dashboard data');
      setVerifications([]);
      setOverview(null);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    loadDashboard();
    return () => {
      isMounted.current = false;
    };
  }, [loadDashboard]);

  return {
    overview,
    verifications,
    topDoctorsByAppointments,
    topDoctorsByRevenue,
    // New pharmacy data
    pharmacyStats,
    productStats,
    orderStats,
    topPharmacies,
    loading,
    error,
    refresh: loadDashboard,
  };
};
