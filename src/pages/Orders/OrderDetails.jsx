import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, ShoppingBag, User, Store, MapPin,
    Calendar, CreditCard, Package
} from 'lucide-react';
import { apiRequest } from '../../utils/api';
import './orders-page.css'; // Reusing orders page styles
import '../../pages/Pharmacies/pharmacies-page.css'; // Reusing basic detail styles

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await apiRequest(`/api/admin/pharmacy/orders/${orderId}`);
                if (response.success) {
                    setOrder(response.data);
                } else {
                    setError(response.message);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    if (loading) return <div className="page-loading">Loading order...</div>;
    if (error) return <div className="page-error">Error: {error}</div>;
    if (!order) return <div className="page-error">Order not found</div>;

    return (
        <div className="pharmacy-details-page">
            <div className="details-header">
                <button className="back-btn" onClick={() => navigate('/orders')}>
                    <ArrowLeft size={18} /> Back to Orders
                </button>
                <div className="header-content">
                    <div className="header-icon" style={{ background: '#fef9c3', color: '#854d0e' }}>
                        <ShoppingBag size={32} />
                    </div>
                    <div>
                        <h1>Order #{order.orderNumber || order._id.slice(-6)}</h1>
                        <p>
                            Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                    </div>
                </div>
            </div>

            <div className="details-grid">
                {/* Sidebar / Info Cards */}
                <div className="sidebar-col" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="info-card">
                        <h3>Customer Details</h3>
                        <div className="info-item">
                            <User size={16} />
                            <div className="column">
                                <span className="label">Name</span>
                                <span className="value">{order.user?.userName || 'Guest User'}</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <div className="column" style={{ marginLeft: '28px' }}>
                                <span className="label">Email</span>
                                <span className="value">{order.user?.email || '-'}</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <div className="column" style={{ marginLeft: '28px' }}>
                                <span className="label">Phone</span>
                                <span className="value">{order.user?.phoneNumber || order.user?.phone || '-'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="info-card">
                        <h3>Shipping Address</h3>
                        <div className="info-item">
                            <MapPin size={16} />
                            <span className="value">
                                {order.shippingAddress ? (
                                    <>
                                        {order.shippingAddress.fullName}<br />
                                        {order.shippingAddress.addressLine1}, {order.shippingAddress.addressLine2}<br />
                                        {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}<br />
                                        Phone: {order.shippingAddress.phoneNumber}
                                    </>
                                ) : (
                                    "No shipping address provided"
                                )}
                            </span>
                        </div>
                    </div>

                    <div className="info-card">
                        <h3>Pharmacy Info</h3>
                        <div className="info-item">
                            <Store size={16} />
                            <div className="column">
                                <span className="label">Store</span>
                                <span className="value">{order.pharmacy?.storeName}</span>
                                <span className="sub-text">Owner: {order.pharmacy?.ownerName}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="main-content">
                    {/* Status Card */}
                    <div className="info-card" style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <span className="label">Current Status</span>
                                <span className={`status-pill ${order.status}`}>{order.status}</span>
                            </div>
                            <div>
                                <span className="label">Payment Status</span>
                                <span className={`payment-badge payment-${(order.paymentStatus || 'pending').toLowerCase()}`}>
                                    {order.paymentStatus || 'Pending'}
                                </span>
                            </div>
                            <div>
                                <span className="label">Payment Method</span>
                                <span className="value" style={{ textTransform: 'capitalize' }}>
                                    {order.paymentMethod || 'Online'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="info-card">
                        <h3>Order Items</h3>
                        <table className="details-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items?.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>
                                            <div className="product-cell-sm">
                                                {/* If product image exists in snapshot, use it, else placeholder */}
                                                <span className="thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Package size={16} />
                                                </span>
                                                <div className="column">
                                                    <span>{item.product?.name || item.name || 'Unknown Product'}</span>
                                                    {item.prescriptionRequired && <span className="sub-text" style={{ color: '#d97706' }}>Rx Required</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td>{item.quantity}</td>
                                        <td>Rs {item.price}</td>
                                        <td>Rs {item.price * item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ background: '#f8fafc' }}>
                                    <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold' }}>Subtotal:</td>
                                    <td style={{ fontWeight: 'bold' }}>Rs {order.total || order.subTotal}</td>
                                </tr>
                                {/* Add tax/shipping rows if data available */}
                                <tr style={{ background: '#f1f5f9', fontSize: '1.1rem' }}>
                                    <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold', borderTop: '2px solid #e2e8f0' }}>Grand Total:</td>
                                    <td style={{ fontWeight: 'bold', color: '#0f172a', borderTop: '2px solid #e2e8f0' }}>Rs {order.totalAmount || order.grandTotal || order.total}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
