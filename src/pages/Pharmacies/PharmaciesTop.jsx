import React, { useMemo } from 'react';
import { BarChart3, Package2, ShoppingBag, Store, TrendingUp, Wallet } from 'lucide-react';
import '../../styles/admin-panel.css';
import { usePharmacyAdminData } from '../../hooks/usePharmacyAdminData';

const formatMoney = (value) => `Rs ${Math.round(value || 0).toLocaleString()}`;

const RankBadge = ({ index }) => {
  const tones = [
    'linear-gradient(135deg, #f59e0b, #fbbf24)',
    'linear-gradient(135deg, #94a3b8, #cbd5e1)',
    'linear-gradient(135deg, #f97316, #fdba74)',
  ];

  return (
    <div
      className="pharmacy-rank-badge"
      style={{ background: tones[index] || 'linear-gradient(135deg, #2563eb, #38bdf8)' }}
    >
      #{index + 1}
    </div>
  );
};

const LeaderCard = ({ title, subtitle, icon: Icon, item, accent }) => {
  if (!item) {
    return (
      <section className="admin-panel-card pharmacy-leader-card">
        <div className="admin-panel-empty">No ranking data available yet.</div>
      </section>
    );
  }

  return (
    <section className="admin-panel-card pharmacy-leader-card" style={{ '--leader-accent': accent }}>
      <div className="pharmacy-leader-header">
        <div>
          <div className="admin-panel-kicker" style={{ marginBottom: 10 }}>
            <Icon size={14} />
            {title}
          </div>
          <h3 className="pharmacy-leader-title">{item.name}</h3>
          <p className="pharmacy-leader-subtitle">{subtitle}</p>
        </div>
        <div className="pharmacy-leader-icon">
          <Icon size={22} />
        </div>
      </div>

      <div className="pharmacy-leader-stats">
        <div className="pharmacy-leader-stat">
          <span>Orders</span>
          <strong>{item.orders}</strong>
        </div>
        <div className="pharmacy-leader-stat">
          <span>Revenue</span>
          <strong>{formatMoney(item.revenue)}</strong>
        </div>
        <div className="pharmacy-leader-stat">
          <span>Products</span>
          <strong>{item.products}</strong>
        </div>
      </div>
    </section>
  );
};

const RankingList = ({ title, subtitle, icon: Icon, rows, metricLabel, renderMetric }) => (
  <section className="admin-panel-card pharmacy-ranking-card">
    <div className="admin-panel-card-header pharmacy-ranking-header">
      <div>
        <h3 className="admin-panel-card-title">{title}</h3>
        <p className="admin-panel-card-subtitle">{subtitle}</p>
      </div>
      <div className="admin-panel-chip">
        <Icon size={14} />
        {rows.length} ranked
      </div>
    </div>

    <div className="pharmacy-ranking-list">
      {rows.map((item, index) => (
        <article key={item.pharmacyId} className="pharmacy-ranking-item">
          <div className="pharmacy-ranking-main">
            <RankBadge index={index} />
            <div className="pharmacy-ranking-copy">
              <h4>{item.name}</h4>
              <p>
                {item.products} products • {item.deliveredOrders} delivered • {item.cancelledOrders} cancelled
              </p>
            </div>
          </div>

          <div className="pharmacy-ranking-metrics">
            <div className="pharmacy-ranking-metric">
              <span>{metricLabel}</span>
              <strong>{renderMetric(item)}</strong>
            </div>
            <div className="pharmacy-ranking-mini">
              <span>AOV</span>
              <strong>{formatMoney(item.averageOrderValue)}</strong>
            </div>
          </div>
        </article>
      ))}
    </div>
  </section>
);

const PharmaciesTop = () => {
  const { loading, error, analytics } = usePharmacyAdminData();

  const summary = useMemo(() => {
    const leaderByOrders = analytics.topByOrders[0];
    const leaderByRevenue = analytics.topByRevenue[0];

    return {
      totalRanked: analytics.rows.length,
      totalOrders: analytics.rows.reduce((sum, item) => sum + item.orders, 0),
      totalRevenue: analytics.rows.reduce((sum, item) => sum + item.revenue, 0),
      totalProducts: analytics.rows.reduce((sum, item) => sum + item.products, 0),
      leaderByOrders,
      leaderByRevenue,
    };
  }, [analytics]);

  return (
    <div className="admin-panel-page">
      <div className="admin-panel-hero">
        <div>
          <div className="admin-panel-kicker">
            <BarChart3 size={14} />
            Performance
          </div>
          <h1 className="admin-panel-title">Top Pharmacies</h1>
          <p className="admin-panel-subtitle">
            A clearer view of leading pharmacy partners by order volume, revenue, and catalog strength.
          </p>
        </div>
      </div>

      <div className="admin-panel-stats">
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Ranked Pharmacies</p>
          <div className="admin-panel-stat-value">{summary.totalRanked}</div>
          <p className="admin-panel-stat-note">Stores with tracked admin activity</p>
        </div>
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Tracked Orders</p>
          <div className="admin-panel-stat-value">{summary.totalOrders}</div>
          <p className="admin-panel-stat-note">Combined pharmacy order volume</p>
        </div>
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Tracked Revenue</p>
          <div className="admin-panel-stat-value">{formatMoney(summary.totalRevenue)}</div>
          <p className="admin-panel-stat-note">Gross revenue from current order data</p>
        </div>
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Live Products</p>
          <div className="admin-panel-stat-value">{summary.totalProducts}</div>
          <p className="admin-panel-stat-note">Catalog size across ranked stores</p>
        </div>
      </div>

      {loading ? (
        <div className="admin-panel-card">
          <div className="loading-state">Loading pharmacy rankings...</div>
        </div>
      ) : error ? (
        <div className="admin-panel-card">
          <div className="error-state">{error}</div>
        </div>
      ) : (
        <>
          <div className="pharmacy-leader-grid">
            <LeaderCard
              title="Order Leader"
              subtitle="Highest order count across pharmacy partners"
              icon={ShoppingBag}
              item={summary.leaderByOrders}
              accent="rgba(37, 99, 235, 0.18)"
            />
            <LeaderCard
              title="Revenue Leader"
              subtitle="Strongest gross revenue performance"
              icon={Wallet}
              item={summary.leaderByRevenue}
              accent="rgba(14, 165, 233, 0.18)"
            />
          </div>

          <div className="pharmacy-ranking-grid">
            <RankingList
              title="Top by Orders"
              subtitle="Most active pharmacies by fulfilled and in-progress volume"
              icon={TrendingUp}
              rows={analytics.topByOrders}
              metricLabel="Orders"
              renderMetric={(item) => item.orders}
            />
            <RankingList
              title="Top by Revenue"
              subtitle="Highest performing stores by gross pharmacy order value"
              icon={Wallet}
              rows={analytics.topByRevenue}
              metricLabel="Revenue"
              renderMetric={(item) => formatMoney(item.revenue)}
            />
          </div>

          <section className="admin-panel-card pharmacy-comparison-card">
            <div className="admin-panel-card-header pharmacy-ranking-header">
              <div>
                <h3 className="admin-panel-card-title">Quick Comparison</h3>
                <p className="admin-panel-card-subtitle">
                  Cross-check order count, revenue, average order value, and products in one table.
                </p>
              </div>
              <div className="admin-panel-chip">
                <Store size={14} />
                Top 10
              </div>
            </div>

            <div className="table-container" style={{ boxShadow: 'none', border: 'none' }}>
              <table className="products-table admin-panel-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Pharmacy</th>
                    <th>Orders</th>
                    <th>Revenue</th>
                    <th>Avg. Order Value</th>
                    <th>Products</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topByRevenue.map((item, index) => (
                    <tr key={item.pharmacyId}>
                      <td>
                        <div className="pharmacy-table-rank">#{index + 1}</div>
                      </td>
                      <td>
                        <div className="admin-panel-entity">
                          <div className="admin-panel-avatar">
                            <Package2 size={18} />
                          </div>
                          <div>
                            <span className="admin-panel-entity-title">{item.name}</span>
                            <span className="admin-panel-entity-subtitle">
                              {item.deliveredOrders} delivered • {item.pendingOrders} pending
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>{item.orders}</td>
                      <td>{formatMoney(item.revenue)}</td>
                      <td>{formatMoney(item.averageOrderValue)}</td>
                      <td>{item.products}</td>
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

export default PharmaciesTop;
