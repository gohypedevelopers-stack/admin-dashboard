import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  FileText,
  Calendar,
  Package,
  ShoppingBag,
  Banknote,
  Store,
  ShieldCheck,
  PauseCircle,
  Clock3,
  Pill,
  AlertTriangle,
  Wallet,
} from 'lucide-react';
import { apiRequest } from '../../utils/api';
import '../../styles/admin-panel.css';
import './pharmacies-page.css';

const resolveImageUrl = (image) => {
  if (!image) return null;
  if (typeof image === 'string') return image;
  return image.url || image.path || null;
};

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const PharmacyDetails = () => {
  const { pharmacyId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`/api/admin/pharmacies/${pharmacyId}`);
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [pharmacyId]);

  const updateStatus = async (status) => {
    try {
      setStatusUpdating(true);
      const response = await apiRequest(`/api/admin/pharmacies/${pharmacyId}/status`, {
        method: 'PATCH',
        body: { status },
      });
      if (response.success) {
        setData((prev) => ({
          ...prev,
          pharmacy: {
            ...prev.pharmacy,
            status,
          },
        }));
      }
    } catch (err) {
      alert(err.message || 'Unable to update pharmacy status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const analytics = useMemo(() => {
    if (!data) {
      return {
        lowStock: 0,
        prescriptionProducts: 0,
        activeProducts: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        paidOrders: 0,
        averageOrderValue: 0,
      };
    }

    const products = data.products || [];
    const orders = data.orders || [];
    const deliveredOrders = orders.filter((order) => order.status === 'delivered');

    return {
      lowStock: products.filter((product) => Number(product.stock || 0) < 10).length,
      prescriptionProducts: products.filter((product) => product.isPrescriptionRequired).length,
      activeProducts: products.filter((product) => !product.isDeleted && product.status !== 'inactive').length,
      pendingOrders: orders.filter((order) => order.status === 'pending' || order.status === 'processing').length,
      deliveredOrders: deliveredOrders.length,
      cancelledOrders: orders.filter((order) => order.status === 'cancelled').length,
      paidOrders: orders.filter((order) => order.paymentStatus === 'paid').length,
      averageOrderValue: deliveredOrders.length
        ? deliveredOrders.reduce((sum, order) => sum + Number(order.total || 0), 0) / deliveredOrders.length
        : 0,
    };
  }, [data]);

  if (loading) return <div className="page-loading">Loading details...</div>;
  if (error) return <div className="page-error">Error: {error}</div>;
  if (!data) return <div className="page-error">No data found</div>;

  const { pharmacy, products, orders, stats } = data;

  return (
    <div className="admin-panel-page pharmacy-details-page">
      <div className="admin-panel-hero details-header" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <button className="admin-action-button secondary" style={{ alignSelf: 'flex-start' }} onClick={() => navigate('/pharmacies')}>
            <ArrowLeft size={16} />
            Back to Pharmacies
          </button>
          <div className="header-content">
            <div className="header-icon">
              <Store size={32} />
            </div>
            <div>
              <div className="admin-panel-kicker">Pharmacy Command Center</div>
              <h1 className="admin-panel-title" style={{ marginTop: 0 }}>{pharmacy.storeName}</h1>
              <p className="admin-panel-subtitle">
                {pharmacy.ownerName} • {pharmacy.status?.toUpperCase()} • Joined {new Date(pharmacy.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="admin-panel-actions">
          {pharmacy.status !== 'active' && (
            <button className="admin-action-button success" onClick={() => updateStatus('active')} disabled={statusUpdating}>
              <ShieldCheck size={16} />
              Approve
            </button>
          )}
          {pharmacy.status !== 'suspended' && (
            <button className="admin-action-button danger" onClick={() => updateStatus('suspended')} disabled={statusUpdating}>
              <PauseCircle size={16} />
              Suspend
            </button>
          )}
          {pharmacy.status !== 'pending' && (
            <button className="admin-action-button secondary" onClick={() => updateStatus('pending')} disabled={statusUpdating}>
              <Clock3 size={16} />
              Set Pending
            </button>
          )}
        </div>
      </div>

      <div className="admin-panel-stats">
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Products</p>
          <div className="admin-panel-stat-value">{stats.totalProducts}</div>
          <p className="admin-panel-stat-note">{analytics.activeProducts} active products</p>
        </div>
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Orders</p>
          <div className="admin-panel-stat-value">{stats.totalOrders}</div>
          <p className="admin-panel-stat-note">{analytics.pendingOrders} pending / processing</p>
        </div>
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Revenue</p>
          <div className="admin-panel-stat-value">{formatCurrency(stats.totalRevenue)}</div>
          <p className="admin-panel-stat-note">{analytics.deliveredOrders} delivered orders</p>
        </div>
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Avg Order Value</p>
          <div className="admin-panel-stat-value">{formatCurrency(analytics.averageOrderValue)}</div>
          <p className="admin-panel-stat-note">{analytics.paidOrders} paid orders</p>
        </div>
      </div>

      <div className="details-grid">
        <div className="info-card">
          <h3>Contact Information</h3>
          <div className="info-item">
            <span className="label">Owner Name</span>
            <span className="value">{pharmacy.ownerName}</span>
          </div>
          <div className="info-item">
            <Mail size={16} />
            <span className="value">{pharmacy.user?.email || pharmacy.email}</span>
          </div>
          <div className="info-item">
            <Phone size={16} />
            <span className="value">{pharmacy.phoneNumber}</span>
          </div>
          <div className="info-item">
            <MapPin size={16} />
            <span className="value">
              {pharmacy.address
                ? `${pharmacy.address.line1 || ''}, ${pharmacy.address.city}, ${pharmacy.address.state} - ${pharmacy.address.pincode}`
                : 'Address not available'}
            </span>
          </div>

          <div className="divider"></div>

          <h3>Business Details</h3>
          <div className="info-item">
            <FileText size={16} />
            <div className="column">
              <span className="label">Drug License</span>
              <span className="value">{pharmacy.drugLicenseNumber}</span>
            </div>
          </div>
          <div className="info-item">
            <Calendar size={16} />
            <div className="column">
              <span className="label">License Expiry</span>
              <span className="value">{pharmacy.licenseExpiryDate ? new Date(pharmacy.licenseExpiryDate).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
          <div className="info-item">
            <div className="column">
              <span className="label">GST Number</span>
              <span className="value">{pharmacy.gstNumber || 'N/A'}</span>
            </div>
          </div>
          <div className="info-item">
            <div className="column">
              <span className="label">PAN Number</span>
              <span className="value">{pharmacy.panNumber || 'N/A'}</span>
            </div>
          </div>

          <div className="divider"></div>

          <h3>Quick Analytics</h3>
          <div className="info-item">
            <AlertTriangle size={16} />
            <div className="column">
              <span className="label">Low Stock Products</span>
              <span className="value">{analytics.lowStock}</span>
            </div>
          </div>
          <div className="info-item">
            <Pill size={16} />
            <div className="column">
              <span className="label">Prescription Products</span>
              <span className="value">{analytics.prescriptionProducts}</span>
            </div>
          </div>
          <div className="info-item">
            <Wallet size={16} />
            <div className="column">
              <span className="label">Cancelled Orders</span>
              <span className="value">{analytics.cancelledOrders}</span>
            </div>
          </div>
        </div>

        <div className="main-content">
          <div className="stats-row">
            <div className="stat-card">
              <Package className="stat-icon" />
              <div className="stat-info">
                <span className="stat-label">Total Products</span>
                <span className="stat-value">{stats.totalProducts}</span>
              </div>
            </div>
            <div className="stat-card">
              <ShoppingBag className="stat-icon" />
              <div className="stat-info">
                <span className="stat-label">Total Orders</span>
                <span className="stat-value">{stats.totalOrders}</span>
              </div>
            </div>
            <div className="stat-card">
              <Banknote className="stat-icon" />
              <div className="stat-info">
                <span className="stat-label">Total Revenue</span>
                <span className="stat-value">{formatCurrency(stats.totalRevenue)}</span>
              </div>
            </div>
          </div>

          <div className="tabs">
            <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              Overview
            </button>
            <button className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
              Products ({products.length})
            </button>
            <button className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
              Orders ({orders.length})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="admin-info-grid">
                <div className="admin-info-card">
                  <span className="admin-info-label">Order Pipeline</span>
                  <div className="admin-info-value">{analytics.pendingOrders} pending / processing</div>
                </div>
                <div className="admin-info-card">
                  <span className="admin-info-label">Delivery Completion</span>
                  <div className="admin-info-value">{analytics.deliveredOrders} delivered</div>
                </div>
                <div className="admin-info-card">
                  <span className="admin-info-label">Payment Success</span>
                  <div className="admin-info-value">{analytics.paidOrders} paid orders</div>
                </div>
                <div className="admin-info-card">
                  <span className="admin-info-label">Inventory Risk</span>
                  <div className="admin-info-value">{analytics.lowStock} low stock items</div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <table className="details-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <div className="product-cell-sm">
                          {resolveImageUrl(p.images?.[0]) && <img src={resolveImageUrl(p.images?.[0])} alt="" className="thumb" />}
                          <span>{p.name}</span>
                        </div>
                      </td>
                      <td>{p.category}</td>
                      <td>{formatCurrency(p.price || p.mrp)}</td>
                      <td style={{ color: p.stock < 10 ? 'red' : 'inherit' }}>{p.stock}</td>
                      <td>{p.isDeleted ? 'Deleted' : p.status || 'Active'}</td>
                    </tr>
                  ))}
                  {products.length === 0 && <tr><td colSpan="5">No products found</td></tr>}
                </tbody>
              </table>
            )}

            {activeTab === 'orders' && (
              <table className="details-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id}>
                      <td className="mono">#{o._id.slice(-6)}</td>
                      <td>
                        <div className="column">
                          <span>{o.shippingAddress?.fullName || 'Unknown'}</span>
                          <span className="sub-text">{o.user?.email}</span>
                        </div>
                      </td>
                      <td>{formatCurrency(o.total)}</td>
                      <td>{o.paymentStatus || 'pending'}</td>
                      <td><span className={`status-pill ${o.status}`}>{o.status}</span></td>
                      <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {orders.length === 0 && <tr><td colSpan="6">No orders found</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyDetails;
