import React from 'react';
import { X, Calendar, Clock, User, Image as ImageIcon } from 'lucide-react';
import '../Pharmacies/product-modal.css'; // Reusing modal styles
import './article-details.css';

const ArticleDetailsModal = ({ isOpen, onClose, article }) => {
    if (!isOpen || !article) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content product-modal"
                style={{ maxWidth: '800px', width: '90%' }}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2 className="modal-title">Article Details</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="article-details-content">
                    <div className="article-hero">
                        {article.image ? (
                            <img src={article.image} alt={article.title} className="hero-image" />
                        ) : (
                            <div className="hero-placeholder">
                                <ImageIcon size={48} />
                            </div>
                        )}
                    </div>

                    <div className="article-meta-row">
                        <div className="meta-item">
                            <Calendar size={16} />
                            <span>{new Date(article.date || article.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="meta-item">
                            <Clock size={16} />
                            <span>{article.time || 'N/A read'}</span>
                        </div>
                        <div className="meta-item">
                            <User size={16} />
                            <span>{article.author?.userName || 'Admin'}</span>
                        </div>
                    </div>

                    <h1 className="article-headline">{article.title}</h1>

                    <div className="article-body">
                        {article.description || <span className="no-content">No content available.</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleDetailsModal;
