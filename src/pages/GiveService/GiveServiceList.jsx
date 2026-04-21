import React, { useEffect, useMemo, useState } from 'react';
import { Eye, HandHeart, Phone, Search, UserRoundCheck, Clock3 } from 'lucide-react';
import { giveServiceService } from '../../services/giveService';
import '../../styles/admin-panel.css';
import '../Appointments/appointments-page.css';

const formatDateTime = (value) => {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const GiveServiceList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [updatingId, setUpdatingId] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const payload = await giveServiceService.getAllRequests();
      setData(payload.data || []);
      setError('');
    } catch (err) {
      setError(err?.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredData = useMemo(() => {
    return (data || []).filter((item) =>
      [item.name, item.mobileNumber, item.profession]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [data, searchTerm]);

  const stats = useMemo(() => ({
    total: data.length,
    pending: data.filter((item) => item.status === 'pending').length,
    contacted: data.filter((item) => item.status === 'contacted').length,
  }), [data]);

  const markContacted = async (requestId) => {
    try {
      setUpdatingId(requestId);
      await giveServiceService.updateStatus(requestId, 'contacted');
      setData((prev) =>
        prev.map((item) => (item._id === requestId ? { ...item, status: 'contacted' } : item))
      );
      setSelectedRequest((prev) => (prev && prev._id === requestId ? { ...prev, status: 'contacted' } : prev));
    } catch (err) {
      alert(err?.message || 'Unable to update request status');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <div className="admin-panel-page">
      <div className="admin-panel-hero">
        <div>
          <div className="admin-panel-kicker">
            <HandHeart size={14} />
            Service Leads
          </div>
          <h1 className="admin-panel-title">Give a Service Requests</h1>
          <p className="admin-panel-subtitle">Review people who want to join the platform, open their details, contact them directly, and keep lead follow-up organized.</p>
        </div>
      </div>

      <div className="admin-panel-stats">
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Total Requests</p>
          <div className="admin-panel-stat-value">{stats.total}</div>
          <p className="admin-panel-stat-note">All submitted leads</p>
        </div>
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Pending</p>
          <div className="admin-panel-stat-value">{stats.pending}</div>
          <p className="admin-panel-stat-note">Still waiting for outreach</p>
        </div>
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Contacted</p>
          <div className="admin-panel-stat-value">{stats.contacted}</div>
          <p className="admin-panel-stat-note">Already followed up</p>
        </div>
      </div>

      <div className="admin-panel-card">
        <div className="admin-panel-toolbar">
          <div className="admin-panel-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name, profession, or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="admin-panel-toolbar-meta">
            <span className="admin-panel-chip">
              <UserRoundCheck size={14} />
              {filteredData.length} visible requests
            </span>
          </div>
        </div>

        {loading ? (
          <div className="admin-panel-empty">Loading requests...</div>
        ) : error ? (
          <div className="admin-panel-empty error-state">{error}</div>
        ) : (
          <table className="admin-panel-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Profession</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Requested On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="admin-panel-empty">No requests found.</td>
                </tr>
              ) : (
                filteredData.map((req) => (
                  <tr key={req._id}>
                    <td>
                      <div className="admin-panel-entity">
                        <div className="admin-panel-avatar">{req.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                        <div>
                          <span className="admin-panel-entity-title">{req.name}</span>
                          <span className="admin-panel-entity-subtitle">Lead ID {req._id?.slice(-6)}</span>
                        </div>
                      </div>
                    </td>
                    <td>{req.profession}</td>
                    <td>{req.mobileNumber}</td>
                    <td>
                      <span className={`status-badge status-${req.status.toLowerCase()}`}>{req.status}</span>
                    </td>
                    <td>{formatDateTime(req.createdAt)}</td>
                    <td>
                      <div className="admin-panel-actions">
                        <button className="admin-action-button" onClick={() => setSelectedRequest(req)}>
                          <Eye size={16} />
                          View
                        </button>
                        <a className="admin-action-button secondary" href={`tel:${req.mobileNumber}`}>
                          <Phone size={16} />
                          Call
                        </a>
                        {req.status !== 'contacted' ? (
                          <button
                            className="admin-action-button success"
                            onClick={() => markContacted(req._id)}
                            disabled={updatingId === req._id}
                          >
                            <UserRoundCheck size={16} />
                            {updatingId === req._id ? 'Updating...' : 'Mark Contacted'}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectedRequest ? (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-content" style={{ maxWidth: 760 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Service Lead Details</h2>
              <button className="close-btn" onClick={() => setSelectedRequest(null)}>×</button>
            </div>
            <div className="modal-body" style={{ display: 'grid', gap: 18 }}>
              <div className="admin-panel-entity">
                <div className="admin-panel-avatar" style={{ width: 64, height: 64 }}>
                  {selectedRequest.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <span className="admin-panel-entity-title" style={{ fontSize: 22 }}>{selectedRequest.name}</span>
                  <span className="admin-panel-entity-subtitle">{selectedRequest.profession}</span>
                  <div style={{ marginTop: 10 }} className="admin-panel-actions">
                    <span className={`status-badge status-${selectedRequest.status.toLowerCase()}`}>{selectedRequest.status}</span>
                  </div>
                </div>
              </div>

              <div className="admin-info-grid">
                <div className="admin-info-card">
                  <span className="admin-info-label">Mobile Number</span>
                  <div className="admin-info-value">{selectedRequest.mobileNumber}</div>
                </div>
                <div className="admin-info-card">
                  <span className="admin-info-label">Profession</span>
                  <div className="admin-info-value">{selectedRequest.profession}</div>
                </div>
                <div className="admin-info-card">
                  <span className="admin-info-label">Requested At</span>
                  <div className="admin-info-value">{formatDateTime(selectedRequest.createdAt)}</div>
                </div>
                <div className="admin-info-card">
                  <span className="admin-info-label">Last Updated</span>
                  <div className="admin-info-value">{formatDateTime(selectedRequest.updatedAt)}</div>
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <a className="admin-action-button secondary" href={`tel:${selectedRequest.mobileNumber}`}>
                <Phone size={16} />
                Call Applicant
              </a>
              <div className="admin-panel-actions">
                {selectedRequest.status !== 'contacted' ? (
                  <button
                    className="admin-action-button success"
                    onClick={() => markContacted(selectedRequest._id)}
                    disabled={updatingId === selectedRequest._id}
                  >
                    <UserRoundCheck size={16} />
                    {updatingId === selectedRequest._id ? 'Updating...' : 'Mark Contacted'}
                  </button>
                ) : null}
                <button className="btn-close" onClick={() => setSelectedRequest(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default GiveServiceList;
