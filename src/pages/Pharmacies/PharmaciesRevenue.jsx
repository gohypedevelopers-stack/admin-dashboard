import React, { useMemo } from 'react';
import { ArrowUpRight, CircleDollarSign, ShoppingBag, Store, Truck, Wallet } from 'lucide-react';
import '../../styles/admin-panel.css';
import { usePharmacyAdminData } from '../../hooks/usePharmacyAdminData';

const formatMoney = (value) => `Rs ${Math.round(value || 0).toLocaleString()}`;

const RevenueHighlightCard = ({ title, subtitle, value, note, icon: Icon, toneClass }) => (
  <section className={`admin-panel-card pharmacy-revenue-highlight ${toneClass}`}>
    <div className="pharmacy-revenue-highlight-head">
      <div className="pharmacy-revenue-highlight-copy">
        <p className="pharmacy-revenue-highlight-label">{title}</p>
        <h3>{value}</h3>
        <p>{subtitle}</p>
      </div>
      <div className="pharmacy-revenue-highlight-icon">
        <Icon size={22} />
      </div>
    </div>
    <div className="pharmacy-revenue-highlight-note">{note}</div>
  </section>
);

const PharmaciesRevenue = () => {
  const { loading, error, analytics } = usePharmacyAdminData();

  const computed = useMemo(() => {
    const ranked = [...analytics.rows].sort((a, b) => b.revenue - a.revenue);
    const totalRevenue = ranked.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = ranked.reduce((sum, item) => sum + item.orders, 0);
    const totalDelivered = ranked.reduce((sum, item) => sum + item.deliveredOrders, 0);
    const leader = ranked[0];
    const bestAov = [...ranked].sort((a, b) => b.averageOrderValue - a.averageOrderValue)[0];

    return {
      ranked,
      totalRevenue,
      totalOrders,
      totalDelivered,
      platformAov: totalOrders ? totalRevenue / totalOrders : 0,
      leader,
      bestAov,
    };
  }, [analytics.rows]);

  return (
    <div className="admin-panel-page">
      <div className="admin-panel-hero">
        <div>
          <div className="admin-panel-kicker">
            <Wallet size={14} />
            Revenue Tracking
          </div>
          <h1 className="admin-panel-title">Pharmacy Revenue</h1>
          <p className="admin-panel-subtitle">
            Monitor pharmacy earnings, average order value, and delivery quality with a clearer financial view.
          </p>
        </div>
      </div>

      <div className="admin-panel-stats">
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Platform Revenue</p>
          <div className="admin-panel-stat-value">{formatMoney(computed.totalRevenue)}</div>
          <p className="admin-panel-stat-note">Combined pharmacy order value</p>
        </div>
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Tracked Orders</p>
          <div className="admin-panel-stat-value">{computed.totalOrders}</div>
          <p className="admin-panel-stat-note">All pharmacy order records</p>
        </div>
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Delivered Orders</p>
          <div className="admin-panel-stat-value">{computed.totalDelivered}</div>
          <p className="admin-panel-stat-note">Completed shipment pipeline</p>
        </div>
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Platform AOV</p>
          <div className="admin-panel-stat-value">{formatMoney(computed.platformAov)}</div>
          <p className="admin-panel-stat-note">Average order value across pharmacies</p>
        </div>
      </div>

      {loading ? (
        <div className="admin-panel-card">
          <div className="loading-state">Loading pharmacy revenue...</div>
        </div>
      ) : error ? (
        <div className="admin-panel-card">
          <div className="error-state">{error}</div>
        </div>
      ) : (
        <>
          <div className="pharmacy-revenue-highlight-grid">
            <RevenueHighlightCard
              title="Highest Revenue"
              subtitle={computed.leader?.name || 'No pharmacy data'}
              value={formatMoney(computed.leader?.revenue)}
              note={`${computed.leader?.orders || 0} orders • ${computed.leader?.deliveredOrders || 0} delivered`}
              icon={CircleDollarSign}
              toneClass="blue"
            />
            <RevenueHighlightCard
              title="Best Avg. Order Value"
              subtitle={computed.bestAov?.name || 'No pharmacy data'}
              value={formatMoney(computed.bestAov?.averageOrderValue)}
              note={`${computed.bestAov?.orders || 0} total orders • ${computed.bestAov?.products || 0} products`}
              icon={ArrowUpRight}
              toneClass="sky"
            />
          </div>

          <div className="pharmacy-revenue-metric-grid">
            {computed.ranked.slice(0, 6).map((item, index) => (
              <section key={item.pharmacyId} className="admin-panel-card pharmacy-revenue-store-card">
                <div className="pharmacy-revenue-store-head">
                  <div className="pharmacy-table-rank">#{index + 1}</div>
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.products} products listed</p>
                  </div>
                </div>

                <div className="pharmacy-revenue-store-grid">
                  <div className="pharmacy-revenue-metric-box">
                    <span><Wallet size={14} /> Revenue</span>
                    <strong>{formatMoney(item.revenue)}</strong>
                  </div>
                  <div className="pharmacy-revenue-metric-box">
                    <span><ShoppingBag size={14} /> Orders</span>
                    <strong>{item.orders}</strong>
                  </div>
                  <div className="pharmacy-revenue-metric-box">
                    <span><Truck size={14} /> Delivered</span>
                    <strong>{item.deliveredOrders}</strong>
                  </div>
                  <div className="pharmacy-revenue-metric-box">
                    <span><Store size={14} /> AOV</span>
                    <strong>{formatMoney(item.averageOrderValue)}</strong>
                  </div>
                </div>
              </section>
            ))}
          </div>

          <section className="admin-panel-card pharmacy-comparison-card">
            <div className="admin-panel-card-header pharmacy-ranking-header">
              <div>
                <h3 className="admin-panel-card-title">Revenue Comparison Table</h3>
                <p className="admin-panel-card-subtitle">
                  Use this for comparing pharmacy contribution, delivery conversion, and basket size.
                </p>
              </div>
              <div className="admin-panel-chip">
                <Wallet size={14} />
                {computed.ranked.length} pharmacies
              </div>
            </div>

            <div className="table-container" style={{ boxShadow: 'none', border: 'none' }}>
              <table className="products-table admin-panel-table">
                <thead>
                  <tr>
                    <th>Pharmacy</th>
                    <th>Total Orders</th>
                    <th>Delivered</th>
                    <th>Cancelled</th>
                    <th>Revenue</th>
                    <th>Avg. Order Value</th>
                  </tr>
                </thead>
                <tbody>
                  {computed.ranked.map((item) => (
                    <tr key={item.pharmacyId}>
                      <td>
                        <div className="admin-panel-entity">
                          <div className="admin-panel-avatar">
                            <Store size={18} />
                          </div>
                          <div>
                            <span className="admin-panel-entity-title">{item.name}</span>
                            <span className="admin-panel-entity-subtitle">
                              {item.pendingOrders} pending • {item.products} products
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>{item.orders}</td>
                      <td>{item.deliveredOrders}</td>
                      <td>{item.cancelledOrders}</td>
                      <td>{formatMoney(item.revenue)}</td>
                      <td>{formatMoney(item.averageOrderValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default PharmaciesRevenue;
