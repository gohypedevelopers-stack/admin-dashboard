import { useCallback, useEffect, useRef, useState } from 'react';
import { apiRequest } from '../utils/api';

const DASHBOARD_ENDPOINTS = {
  overview: '/api/admin/dashboard/stats',
  verifications: '/api/admin/verifications?type=doctor&limit=5&page=1',
  topDoctors: '/api/doctors/top?limit=5',
};

export const useDashboardData = () => {
  const isMounted = useRef(true);
  const [overview, setOverview] = useState(null);
  const [verifications, setVerifications] = useState([]);
  const [topDoctors, setTopDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    if (!isMounted.current) return;
    setLoading(true);
    setError('');

    try {
      const [overviewRes, verifsRes, topDoctorsRes] = await Promise.all([
        apiRequest(DASHBOARD_ENDPOINTS.overview),
        apiRequest(DASHBOARD_ENDPOINTS.verifications),
        apiRequest(DASHBOARD_ENDPOINTS.topDoctors),
      ]);

      if (!isMounted.current) return;

      setOverview(overviewRes?.data ?? null);
      setVerifications(verifsRes?.data?.verifications ?? []);
      setTopDoctors(topDoctorsRes?.data ?? []);
    } catch (err) {
      if (!isMounted.current) return;
      setError(err?.message || 'Unable to load dashboard data');
      setVerifications([]);
      setTopDoctors([]);
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
    topDoctors,
    loading,
    error,
    refresh: loadDashboard,
  };
};
