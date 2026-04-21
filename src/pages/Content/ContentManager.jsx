import React, { useState, useMemo } from 'react';
import { Plus, Search, FileText, Image as ImageIcon, Eye, Edit, LayoutTemplate, BookOpen, CalendarDays } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData';
import { apiRequest } from '../../utils/api';
import ArticleModal from '../../components/Content/ArticleModal';
import ArticleDetailsModal from '../../components/Content/ArticleDetailsModal';
import './content-manager.css';
import '../../styles/admin-panel.css';

const ContentManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articleToEdit, setArticleToEdit] = useState(null);

  const { data, loading, error } = useApiData(async () => {
    const payload = await apiRequest('/api/admin/health-articles');
    return Array.isArray(payload?.data) ? payload.data : [];
  }, [refreshKey]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter(article =>
      (article.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const stats = useMemo(() => {
    const source = data || [];
    const thisMonth = new Date().getMonth();
    const recent = source.filter((item) => {
      const created = new Date(item.createdAt || item.date);
      return !Number.isNaN(created.getTime()) && created.getMonth() === thisMonth;
    }).length;

    return {
      total: source.length,
      withImages: source.filter((item) => !!item.image).length,
      thisMonth: recent,
    };
  }, [data]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleModalSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleAddClick = () => {
    setArticleToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (article) => {
    setArticleToEdit(article);
    setIsModalOpen(true);
  };

  const handleViewClick = (article) => {
    setSelectedArticle(article);
    setIsDetailsOpen(true);
  };

  return (
    <div className="admin-panel-page content-page">
      <div className="admin-panel-hero">
        <div>
          <div className="admin-panel-kicker">
            <LayoutTemplate size={14} />
            Content Studio
          </div>
          <h1 className="admin-panel-title">Content Manager</h1>
          <p className="admin-panel-subtitle">Manage health articles, keep media organized, and review exactly how each article card will look before publishing.</p>
        </div>
        <button className="admin-panel-action btn-primary" onClick={handleAddClick}>
          <Plus size={20} />
          Add Article
        </button>
      </div>

      <div className="admin-panel-stats">
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Articles</p>
          <div className="admin-panel-stat-value">{stats.total}</div>
          <p className="admin-panel-stat-note">Managed from admin</p>
        </div>
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">With Cover Image</p>
          <div className="admin-panel-stat-value">{stats.withImages}</div>
          <p className="admin-panel-stat-note">Ready for visual cards</p>
        </div>
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">This Month</p>
          <div className="admin-panel-stat-value">{stats.thisMonth}</div>
          <p className="admin-panel-stat-note">Freshly added content</p>
        </div>
      </div>

      <div className="admin-panel-card table-container">
        <div className="admin-panel-toolbar controls-bar">
          <div className="admin-panel-search search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="admin-panel-toolbar-meta">
            <span className="admin-panel-chip">
              <BookOpen size={14} />
              {filteredData.length} shown
            </span>
          </div>
        </div>

        {loading ? (
          <div className="admin-panel-empty loading-state">Loading content...</div>
        ) : error ? (
          <div className="admin-panel-empty error-state">{error}</div>
        ) : (
          <table className="admin-panel-table content-table">
            <thead>
              <tr>
                <th>Article</th>
                <th>Type</th>
                <th>Author</th>
                <th>Date</th>
                <th>Time to Read</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="admin-panel-empty empty-state">No articles found.</td>
                </tr>
              ) : (
                filteredData.map((article) => (
                  <tr key={article._id}>
                    <td>
                      <div className="admin-panel-entity article-info">
                        {article.image ? (
                          <img src={article.image} alt="" className="article-image" style={{ width: 64, height: 48, borderRadius: 14 }} />
                        ) : (
                          <div className="admin-panel-avatar article-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 48, borderRadius: 14 }}>
                            <ImageIcon size={20} color="#94a3b8" />
                          </div>
                        )}
                        <div className="article-details" style={{ gap: 4 }}>
                          <span className="admin-panel-entity-title article-title">{article.title}</span>
                          <span className="admin-panel-entity-subtitle">Health article</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="type-badge">Article</span></td>
                    <td>{article.author?.userName || 'Admin'}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <CalendarDays size={14} />
                        {formatDate(article.date || article.createdAt)}
                      </span>
                    </td>
                    <td>{article.time || '-'}</td>
                    <td>
                      <div className="admin-panel-actions">
                        <button
                          className="admin-action-button"
                          onClick={() => handleViewClick(article)}
                          title="View Details"
                        >
                          <Eye size={16} />
                          View
                        </button>
                        <button
                          className="admin-action-button secondary"
                          onClick={() => handleEditClick(article)}
                          title="Edit Article"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <ArticleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        articleToEdit={articleToEdit}
      />

      <ArticleDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        article={selectedArticle}
      />
    </div>
  );
};

export default ContentManager;

