import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, FileText, Image as ImageIcon } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData';
import { apiRequest } from '../../utils/api';
import ArticleModal from '../../components/Content/ArticleModal';
import './content-manager.css';

const ContentManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, loading, error } = useApiData(async () => {
    // Using the correct endpoint found in app_routes.js
    const payload = await apiRequest('/api/admin/health-articles');
    console.log('Article data:', payload);
    return Array.isArray(payload?.data) ? payload.data : [];
  }, [refreshKey]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter(article =>
      (article.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

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

  return (
    <div className="content-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Content Manager</h1>
          <p className="page-subtitle">Manage health articles and educational content.</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={20} />
            Add Article
          </button>
        </div>
      </div>

      <div className="table-container">
        <div className="controls-bar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search articles..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="action-btn">
            <Filter size={18} />
          </button>
        </div>

        {loading ? (
          <div className="loading-state">Loading content...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <table className="content-table">
            <thead>
              <tr>
                <th>Article</th>
                <th>Type</th>
                <th>Author</th>
                <th>Date</th>
                <th>Time to Read</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">No articles found.</td>
                </tr>
              ) : (
                filteredData.map((article) => (
                  <tr key={article._id}>
                    <td>
                      <div className="article-info">
                        {article.image ? (
                          <img src={article.image} alt="" className="article-image" />
                        ) : (
                          <div className="article-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ImageIcon size={20} color="#94a3b8" />
                          </div>
                        )}
                        <div className="article-details">
                          <span className="article-title">{article.title}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="type-badge">Article</span></td>
                    <td>{article.author?.userName || 'Admin'}</td>
                    <td>{formatDate(article.date || article.createdAt)}</td>
                    <td>{article.time || '-'}</td>
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
      />
    </div>
  );
};

export default ContentManager;

