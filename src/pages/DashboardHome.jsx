import React, { useMemo, useState } from 'react';
import {
  Users,
  Calendar,
  IndianRupee,
  ShieldAlert,
  MessageSquare,
  RefreshCw,
  AlertCircle,
  MoreHorizontal,
  Package,
  ShoppingCart,
  Store,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import AddAdminModal from '../components/Common/AddAdminModal';
import { useDashboardData } from '../hooks/useDashboardData';
import { useNavigate } from 'react-router-dom';
import './dashboard.css';



const formatCurrency = (value) =>
  typeof value === 'number'
    ? `₹${value.toLocaleString('en-IN')}`
    : value || '₹0';

const formatNumber = (value) =>
  typeof value === 'number' ? value.toLocaleString('en-IN') : value || '0';

const formatTrendLabel = (value) => {
  if (!value) return '';
  const parsedDate = new Date(value);
  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
  return value.length > 10 ? value.slice(0, 10) : value;
};

const StatCard = ({ title, value, note, trend, icon: Icon, color, onClick }) => {
  const clickable = typeof onClick === 'function';
  return (
    <button
      type="button"
      className={`stat-card ${clickable ? 'stat-card-clickable' : ''}`}
      onClick={clickable ? onClick : undefined}
    >
      <div className="stat-top">
        <div className="stat-text">
          <p className="stat-title">{title}</p>
          <h3 className="stat-value">{value}</h3>
        </div>
        <div className={`stat-icon ${color}`}>
          <Icon size={20} className="stat-icon-svg" />
        </div>
      </div>
      <div className="stat-foot">
        {trend && <span className="stat-trend">{trend}</span>}
        {note && <span className="stat-note">{note}</span>}
      </div>
    </button>
  );
};

const DashboardHome = () => {
  const {
    overview,
    verifications,
    topDoctorsByAppointments,
    topDoctorsByRevenue,
    pharmacyStats,
    productStats,
    orderStats,
    topPharmacies,
    loading,
    error,
    refresh,
  } = useDashboardData();
  const navigate = useNavigate();
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const isInitialLoad = loading && !overview;

  const pendingDoctors = overview?.verifications?.pendingDoctors ?? 0;
  const pendingPharmacies = overview?.verifications?.pendingPharmacies ?? 0;
  const totalPending = pendingDoctors + pendingPharmacies;
  const supportQueueCount = overview?.supportQueue ?? 0;

  const statItems = useMemo(() => {
    const totals = overview?.totals ?? {};
    const ticketCount = overview?.supportQueue ?? 0;
    return [
      {
        title: 'Total Patients',
        value: formatNumber(totals.users),
        note: `${formatNumber(ticketCount)} open support tickets`,
        onClick: () => navigate('/users'),
        icon: Users,
        color: 'blue',
      },
      {
        title: 'Bookings',
        value: formatNumber(totals.bookings),
        note: `Orders: ${formatNumber(totals.orders)} · Appointments: ${formatNumber(totals.appointments)}`,
        onClick: () => navigate('/appointments'),
        icon: Calendar,
        color: 'purple',
      },
      {
        title: 'Revenue',
        value: formatCurrency(overview?.revenue?.amount),
        note: `Completed orders: ${formatNumber(overview?.revenue?.completedOrders)}`,
        icon: IndianRupee,
        color: 'green',
        onClick: () => setShowRevenueModal(true),
      },
      {
        title: 'Pending Verifications',
        value: formatNumber(totalPending),
        trend: `${formatNumber(pendingDoctors)} doctors · ${formatNumber(pendingPharmacies)} pharmacies`,
        onClick: () => navigate('/verification'),
        icon: ShieldAlert,
        color: 'orange',
      },
    ];
  }, [
    overview,
    pendingDoctors,
    pendingPharmacies,
    totalPending,
    navigate,
  ]);

  const trendData = useMemo(() => {
    if (!overview?.trend || !Array.isArray(overview.trend)) return [];

    return overview.trend.map((item) => ({
      name: formatTrendLabel(item.date),
      appointments: item.count,
      value: item.count,
    }));
  }, [overview]);

  const sparklineData = trendData.map((item) => ({
    month: item.name,
    value: item.value,
  }));

  const settingsMap = useMemo(() => {
    const map = new Map();
    (overview?.settings || []).forEach((setting) => {
      map.set(setting.key, setting);
    });
    return map;
  }, [overview]);

  const highlightedSettings = [
    { label: 'Slot Duration', key: 'slotDuration' },
    { label: 'Cancellation Policy', key: 'cancellationPolicy' },
    { label: 'Refund Window', key: 'refundWindow' },
    { label: 'Platform Fee', key: 'platformFee' },
    { label: 'GST / Tax', key: 'taxSettings' },
  ];

  const formatSettingValue = (value) => {
    if (value == null) return 'Not configured';
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Removed reports usage

  const flags = overview?.featureFlags || [];
  const health = overview?.systemHealth?.mongodb;

  const handleAddAdminSuccess = (newAdmin) => {
    // Optionally show toast
    console.log('New admin created', newAdmin);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-title">
          <h1>Admin overview</h1>
          <p className="header-subtitle">Securely monitor users, verifications, finance, and platform health.</p>
        </div>
        <div className="header-actions">
          <button className="secondary-button" onClick={refresh} disabled={loading}>
            <RefreshCw size={16} />
            {loading ? 'Refreshing' : 'Refresh'}
          </button>
          <button className="primary-button" onClick={() => setShowAddAdminModal(true)}>
            <Users size={16} />
            Add Admin
          </button>
        </div>
      </header>

      {error && (
        <div className="alert-box alert-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {isInitialLoad && (
        <div className="alert-box alert-info">
          <RefreshCw size={16} />
          <span>Loading dashboard data…</span>
        </div>
      )}

      <section className="stats-grid">
        {statItems.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}
      </section>

      {/* Pharmacy Overview Stats */}
      <section className="stats-grid" style={{ marginTop: '1.5rem' }}>
        <StatCard
          title="Total Pharmacies"
          value={formatNumber(pharmacyStats.total)}
          note={`Active: ${formatNumber(pharmacyStats.active)} · Pending: ${formatNumber(pharmacyStats.pending)}`}
          icon={Store}
          color="teal"
          onClick={() => navigate('/pharmacies')}
        />
        <StatCard
          title="Inventory Products"
          value={formatNumber(productStats.total)}
          note={productStats.lowStock > 0 ? `⚠ ${formatNumber(productStats.lowStock)} low stock items` : 'All products stocked'}
          icon={Package}
          color="indigo"
          onClick={() => navigate('/products')}
        />
        <StatCard
          title="Pharmacy Orders"
          value={formatNumber(orderStats.total)}
          note={`Pending: ${formatNumber(orderStats.byStatus?.pending || 0)} · Delivered: ${formatNumber(orderStats.byStatus?.delivered || 0)}`}
          icon={ShoppingCart}
          color="amber"
          onClick={() => navigate('/orders')}
        />
        <StatCard
          title="Pharmacy Revenue"
          value={formatCurrency(orderStats.totalRevenue)}
          note={`From ${formatNumber((orderStats.byStatus?.delivered || 0) + (orderStats.byStatus?.shipped || 0))} completed orders`}
          icon={TrendingUp}
          color="emerald"
        />
      </section>

      <section className="chart-card">
        <div className="chart-head">
          <div>
            <h3>Appointments trend</h3>
            <p className="chart-subtitle">Daily bookings collected by the system.</p>
          </div>
        </div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.25} />
              <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 12 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [formatNumber(value), 'Appointments']}
                labelFormatter={(label) => `Date: ${label}`}
                wrapperStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 12px 30px rgba(15,23,42,0.08)' }}
              />
              <Bar dataKey="appointments" fill="#2563eb" radius={[6, 6, 4, 4]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="section-grid">
        <div className="list-card">
          <div className="list-header">
            <h3>Verification queue</h3>
            <p>{formatNumber(totalPending)} submissions pending review</p>
          </div>
          <div className="table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Specialization</th>
                  <th>City</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {verifications.length === 0 && (
                  <tr>
                    <td colSpan="4" className="empty-row">
                      No verification submissions waiting for review.
                    </td>
                  </tr>
                )}
                {verifications.map((verification) => (
                  <tr key={verification._id}>
                    <td>{verification.personalDetails?.fullName || 'Unknown doctor'}</td>
                    <td>{verification.personalDetails?.medicalSpecialization || 'General'}</td>
                    <td>{verification.personalDetails?.city || '—'}</td>
                    <td>
                      <span className={`status-pill status-${verification.status}`}>
                        {verification.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section-grid">
        {/* Most Popular Doctors */}
        <div className="list-card">
          <div className="list-header">
            <h3>Most Popular Doctors</h3>
            <p>By appointment volume</p>
          </div>
          <ul className="compact-list">
            {topDoctorsByAppointments.length === 0 && <li className="empty-row">No data available yet.</li>}
            {topDoctorsByAppointments.map((doctor, idx) => (
              <li key={doctor._id || idx}>
                <div>
                  <p className="compact-title">
                    {idx + 1}. {doctor.fullName || doctor.name || 'Doctor'}
                  </p>
                  <p className="compact-meta">
                    {doctor.specialization || 'General'} · {doctor.city || 'Remote'}
                  </p>
                </div>
                <strong>{formatNumber(doctor.value)} Appts</strong>
              </li>
            ))}
          </ul>
        </div>

        {/* Highest Earning Doctors */}
        <div className="list-card">
          <div className="list-header">
            <h3>Highest Earning Doctors</h3>
            <p>By total revenue generated</p>
          </div>
          <ul className="compact-list">
            {topDoctorsByRevenue.length === 0 && <li className="empty-row">No data available yet.</li>}
            {topDoctorsByRevenue.map((doctor, idx) => (
              <li key={doctor._id || idx}>
                <div>
                  <p className="compact-title">
                    {idx + 1}. {doctor.fullName || doctor.name || 'Doctor'}
                  </p>
                  <p className="compact-meta">
                    {doctor.specialization || 'General'} · {doctor.city || 'Remote'}
                  </p>
                </div>
                <strong>{formatCurrency(doctor.value)}</strong>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Order Analytics Section */}
      <section className="section-grid">
        <div className="list-card" style={{ gridColumn: 'span 2' }}>
          <div className="list-header">
            <h3>Order Analytics</h3>
            <p>Pharmacy order status breakdown and recent activity</p>
          </div>
          <div className="health-row" style={{ marginBottom: '1rem' }}>
            {Object.entries(orderStats.byStatus || {}).map(([status, count]) => (
              <div key={status} style={{ textAlign: 'center', flex: 1 }}>
                <p className="health-label" style={{ textTransform: 'capitalize' }}>{status.replace(/_/g, ' ')}</p>
                <p className="health-value">{formatNumber(count)}</p>
              </div>
            ))}
            {Object.keys(orderStats.byStatus || {}).length === 0 && (
              <p className="empty-row" style={{ width: '100%', textAlign: 'center' }}>No order data yet.</p>
            )}
          </div>
          <div className="table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orderStats.recentOrders.length === 0 && (
                  <tr>
                    <td colSpan="4" className="empty-row">No recent orders.</td>
                  </tr>
                )}
                {orderStats.recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.customerName}</td>
                    <td>{formatCurrency(order.total)}</td>
                    <td>
                      <span className={`status-pill status-${order.status}`}>
                        {order.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Top Pharmacies Section */}
      <section className="section-grid">
        <div className="list-card">
          <div className="list-header">
            <h3>Top Pharmacies by Orders</h3>
            <p>By total order count</p>
          </div>
          <ul className="compact-list">
            {topPharmacies.byOrders.length === 0 && <li className="empty-row">No pharmacy order data.</li>}
            {topPharmacies.byOrders.map((pharmacy, idx) => (
              <li key={pharmacy.pharmacyId || idx}>
                <div>
                  <p className="compact-title">
                    {idx + 1}. {pharmacy.name || 'Unknown Pharmacy'}
                  </p>
                </div>
                <strong>{formatNumber(pharmacy.orderCount)} Orders</strong>
              </li>
            ))}
          </ul>
        </div>
        <div className="list-card">
          <div className="list-header">
            <h3>Top Pharmacies by Revenue</h3>
            <p>By total revenue earned</p>
          </div>
          <ul className="compact-list">
            {topPharmacies.byRevenue.length === 0 && <li className="empty-row">No pharmacy revenue data.</li>}
            {topPharmacies.byRevenue.map((pharmacy, idx) => (
              <li key={pharmacy.pharmacyId || idx}>
                <div>
                  <p className="compact-title">
                    {idx + 1}. {pharmacy.name || 'Unknown Pharmacy'}
                  </p>
                </div>
                <strong>{formatCurrency(pharmacy.revenue)}</strong>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-grid">
        <div className="list-card">
          <div className="list-header">
            <h3>System health & settings</h3>
            <p>Realtime indicators + key platform knobs</p>
          </div>
          <div className="health-row">
            <div>
              <p className="health-label">MongoDB status</p>
              <div className="health-value">
                <span className={`health-dot ${health?.status === 'connected' ? 'status-green' : 'status-red'}`} />
                <span>{health?.status || 'Offline'}</span>
              </div>
              <p className="health-meta">Ready state {health?.readyState ?? '—'}</p>
            </div>
            <div>
              <p className="health-label">Support queue</p>
              <p className="health-value">{formatNumber(overview?.supportQueue)}</p>
              <p className="health-meta">tickets awaiting follow-up</p>
            </div>
          </div>
          <div className="settings-grid">
            {highlightedSettings.map((setting) => (
              <div key={setting.key} className="setting-pill">
                <p className="setting-label">{setting.label}</p>
                <p className="setting-value">
                  {formatSettingValue(settingsMap.get(setting.key)?.value)}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="list-card">
          <div className="list-header">
            <h3>Feature flags</h3>
            <p>Toggle platform capabilities</p>
          </div>
          <div className="flags-grid">
            {flags.length === 0 && <p className="empty-row">No feature flags configured.</p>}
            {flags.map((flag) => (
              <div key={flag.name} className="flag-card">
                <div className="flag-head">
                  <strong>{flag.name}</strong>
                  <span className={`flag-pill ${flag.enabled ? 'flag-enabled' : 'flag-disabled'}`}>
                    {flag.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <p className="flag-desc">{flag.description || 'No description available.'}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {showRevenueModal && (
        <div className="modal-overlay" onClick={() => setShowRevenueModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p className="eyebrow">Revenue</p>
                <h3 className="modal-title">Revenue overview</h3>
                <p className="modal-subtitle">
                  Revenue trends from the same dataset powering the dashboard chart.
                </p>
              </div>
              <button className="icon-button" onClick={() => setShowRevenueModal(false)} aria-label="Close">
                <AlertCircle size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="summary-strip">
                <div>
                  <p className="label">Total collected</p>
                  <h4 className="value">{formatCurrency(overview?.revenue?.amount)}</h4>
                </div>
                <div>
                  <p className="label">Completed orders</p>
                  <p className="value-sm">{formatNumber(overview?.revenue?.completedOrders)}</p>
                </div>
                <div>
                  <p className="label">Pending reviews</p>
                  <p className="trend positive">{formatNumber(totalPending)}</p>
                </div>
              </div>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineData} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#475569', fontSize: 12 }} hide />
                    <Tooltip
                      formatter={(value) => [formatCurrency(value), 'Value']}
                      labelStyle={{ color: '#0f172a', fontWeight: 700 }}
                      contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(15,23,42,0.08)' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#047857" strokeWidth={2.5} fillOpacity={1} fill="url(#revGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      <AddAdminModal
        open={showAddAdminModal}
        onClose={() => setShowAddAdminModal(false)}
        onSuccess={handleAddAdminSuccess}
      />
    </div>
  );
};

export default DashboardHome;
