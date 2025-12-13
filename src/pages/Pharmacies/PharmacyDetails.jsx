import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, MapPin, Phone, Mail, FileText,
    Calendar, Package, ShoppingBag, Banknote, Store
} from 'lucide-react';
import { apiRequest } from '../../utils/api';
import './pharmacies-page.css';

const PharmacyDetails = () => {
    const { pharmacyId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
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
        fetchDetails();
    }, [pharmacyId]);

    if (loading) return <div className="page-loading">Loading details...</div>;
    if (error) return <div className="page-error">Error: {error}</div>;
    if (!data) return <div className="page-error">No data found</div>;

    const { pharmacy, products, orders, stats } = data;

    return (
        <div className="pharmacy-details-page">
            <div className="details-header">
                <button className="back-btn" onClick={() => navigate('/pharmacies')}>
                    <ArrowLeft size={18} /> Back to List
                </button>
                <div className="header-content">
                    <div className="header-icon">
                        <Store size={32} />
                    </div>
                    <div>
                        <h1>{pharmacy.storeName}</h1>
                        <p>{pharmacy.status?.toUpperCase()} • Joined {new Date(pharmacy.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            <div className="details-grid">
                {/* Sidebar Info */}
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
                            {pharmacy.address ?
                                `${pharmacy.address.line1 || ''}, ${pharmacy.address.city}, ${pharmacy.address.state} - ${pharmacy.address.pincode}`
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
                </div>

                {/* Main Content Area */}
                <div className="main-content">
                    {/* Stats Row */}
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
                                <span className="stat-value">Rs {stats.totalRevenue?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="tabs">
                        <button
                            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            Overview
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                            onClick={() => setActiveTab('products')}
                        >
                            Products ({products.length})
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            Orders ({orders.length})
                        </button>
                    </div>

                    <div className="tab-content">
                        {activeTab === 'overview' && (
                            <div className="overview-tab">
                                {/* Can add charts or recent activity summary here later */}
                                <p>Select a tab to view detailed records.</p>
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
                                    {products.map(p => (
                                        <tr key={p._id}>
                                            <td>
                                                <div className="product-cell-sm">
                                                    {p.images?.[0] && <img src={p.images[0]} alt="" className="thumb" />}
                                                    <span>{p.name}</span>
                                                </div>
                                            </td>
                                            <td>{p.category}</td>
                                            <td>Rs {p.price || p.mrp}</td>
                                            <td style={{ color: p.stock < 10 ? 'red' : 'inherit' }}>{p.stock}</td>
                                            <td>{p.isDeleted ? 'Deleted' : 'Active'}</td>
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
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(o => (
                                        <tr key={o._id}>
                                            <td className="mono">#{o._id.slice(-6)}</td>
                                            <td>
                                                <div className="column">
                                                    <span>{o.shippingAddress?.fullName || 'Unknown'}</span>
                                                    <span className="sub-text">{o.user?.email}</span>
                                                </div>
                                            </td>
                                            <td>Rs {o.total}</td>
                                            <td><span className={`status-pill ${o.status}`}>{o.status}</span></td>
                                            <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && <tr><td colSpan="5">No orders found</td></tr>}
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
