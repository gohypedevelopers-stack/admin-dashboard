import { useCallback, useEffect, useRef, useState } from 'react';
import { apiRequest } from '../utils/api';

const DASHBOARD_ENDPOINTS = {
  overview: '/api/admin/dashboard/overview',
  reports: '/api/admin/reports',
  verifications: '/api/admin/verifications?type=doctor&limit=5&page=1',
  support: '/api/admin/support/tickets?status=open&limit=5&page=1',
  topDoctors: '/api/doctors/top?limit=5',
};

export const useDashboardData = () => {
  const isMounted = useRef(true);
  const [overview, setOverview] = useState(null);
  const [reports, setReports] = useState(null);
  const [verifications, setVerifications] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [topDoctors, setTopDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    if (!isMounted.current) return;
    setLoading(true);
    setError('');

    try {
      const [overviewRes, reportsRes, verifsRes, supportRes, topDoctorsRes] = await Promise.all([
        apiRequest(DASHBOARD_ENDPOINTS.overview),
        apiRequest(DASHBOARD_ENDPOINTS.reports),
        apiRequest(DASHBOARD_ENDPOINTS.verifications),
        apiRequest(DASHBOARD_ENDPOINTS.support),
        apiRequest(DASHBOARD_ENDPOINTS.topDoctors),
      ]);

      if (!isMounted.current) return;

      setOverview(overviewRes?.data ?? null);
      setReports(reportsRes?.data ?? null);
      setVerifications(verifsRes?.data?.verifications ?? []);
      setSupportTickets(supportRes?.data?.tickets ?? []);
      setTopDoctors(topDoctorsRes?.data ?? []);
    } catch (err) {
      if (!isMounted.current) return;
      setError(err?.message || 'Unable to load dashboard data');
      setVerifications([]);
      setSupportTickets([]);
      setTopDoctors([]);
      setOverview(null);
      setReports(null);
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
    reports,
    verifications,
    supportTickets,
    topDoctors,
    loading,
    error,
    refresh: loadDashboard,
  };
};
