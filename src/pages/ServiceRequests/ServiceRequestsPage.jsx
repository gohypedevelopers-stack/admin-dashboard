import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  KeyRound,
  Phone,
  Search,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import { serviceRequestService } from '../../services/serviceRequestService';
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

const titleCase = (value) =>
  String(value || '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase()) || '-';

const requestForLabel = (item) =>
  item.requestFor === 'other' ? 'For Other' : 'For Myself';

const leadSourceLabel = (value) =>
  String(value || '').toLowerCase() === 'website' ? 'Website' : 'App';

const ServiceRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [updatingId, setUpdatingId] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const payload = await serviceRequestService.getAllRequests();
      setRequests(payload.data || []);
      setError('');
    } catch (err) {
      setError(err?.message || 'Failed to fetch service requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return requests;
    return requests.filter((item) =>
      [
        item.name,
        item.mobileNumber,
        item.city,
        item.address,
        item.leadSource,
        item.serviceType,
        item.serviceTitle,
        item.providerName,
        item.requestOtp,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [requests, searchTerm]);

  const stats = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((item) => item.status === 'pending').length,
      contacted: requests.filter((item) => item.status === 'contacted').length,
      closed: requests.filter((item) => item.status === 'closed').length,
    }),
    [requests]
  );

  const updateStatus = async (requestId, status) => {
    try {
      setUpdatingId(requestId);
      const payload = await serviceRequestService.updateStatus(requestId, status);
      const updated = payload.data;
      setRequests((prev) =>
        prev.map((item) => (item._id === requestId ? updated : item))
      );
      setSelectedRequest((prev) =>
        prev && prev._id === requestId ? updated : prev
      );
    } catch (err) {
      window.alert(err?.message || 'Unable to update request status');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <div className="admin-panel-page">
      <div className="admin-panel-hero">
        <div>
          <div className="admin-panel-kicker">
            <Stethoscope size={14} />
            Patient Service Requests
          </div>
          <h1 className="admin-panel-title">Doctor, Physiotherapy, Nurse And Pharmacy Requests</h1>
          <p className="admin-panel-subtitle">
            Track every patient request, booking details, generated OTP, contact number, and follow-up status from one place.
          </p>
        </div>
      </div>

      <div className="admin-panel-stats">
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Total Requests</p>
          <div className="admin-panel-stat-value">{stats.total}</div>
          <p className="admin-panel-stat-note">All patient service requests</p>
        </div>
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Pending</p>
          <div className="admin-panel-stat-value">{stats.pending}</div>
          <p className="admin-panel-stat-note">Need action</p>
        </div>
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Contacted</p>
          <div className="admin-panel-stat-value">{stats.contacted}</div>
          <p className="admin-panel-stat-note">Reached patient/provider</p>
        </div>
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Closed</p>
          <div className="admin-panel-stat-value">{stats.closed}</div>
          <p className="admin-panel-stat-note">Flow completed</p>
        </div>
      </div>

      <div className="admin-panel-card">
        <div className="admin-panel-toolbar">
          <div className="admin-panel-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by patient, provider, OTP, phone, or service"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="admin-panel-toolbar-meta">
            <span className="admin-panel-chip">
              <CheckCircle2 size={14} />
              {filteredRequests.length} visible requests
            </span>
          </div>
        </div>

        {loading ? (
          <div className="admin-panel-empty">Loading service requests...</div>
        ) : error ? (
          <div className="admin-panel-empty error-state">{error}</div>
        ) : (
          <table className="admin-panel-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Request Type</th>
                <th>Source</th>
                <th>Service</th>
                <th>Provider</th>
                <th>OTP</th>
                <th>Status</th>
                <th>Requested On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="9" className="admin-panel-empty">No service requests found.</td>
                </tr>
              ) : (
                filteredRequests.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="admin-panel-entity">
                        <div className="admin-panel-avatar">
                          {item.name?.charAt(0)?.toUpperCase() || 'P'}
                        </div>
                        <div>
                          <span className="admin-panel-entity-title">{item.name}</span>
                          <span className="admin-panel-entity-subtitle">{item.mobileNumber}</span>
                        </div>
                      </div>
                    </td>
                    <td>{requestForLabel(item)}</td>
                    <td>{leadSourceLabel(item.leadSource)}</td>
                    <td>
                      <div style={{ display: 'grid', gap: 4 }}>
                        <span className="admin-panel-entity-title">{titleCase(item.serviceType)}</span>
                        <span className="admin-panel-entity-subtitle">{item.serviceTitle || '-'}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'grid', gap: 4 }}>
                        <span className="admin-panel-entity-title">{item.providerName || 'Support contact'}</span>
                        <span className="admin-panel-entity-subtitle">{item.providerPhone || '-'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="admin-panel-chip">
                        <KeyRound size={14} />
                        {item.requestOtp}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${String(item.status || 'pending').toLowerCase()}`}>
                        {titleCase(item.status)}
                      </span>
                    </td>
                    <td>{formatDateTime(item.createdAt)}</td>
                    <td>
                      <div className="admin-panel-actions">
                        <button className="admin-action-button" onClick={() => setSelectedRequest(item)}>
                          <Eye size={16} />
                          View
                        </button>
                        {item.providerPhone ? (
                          <a className="admin-action-button secondary" href={`tel:${item.providerPhone}`}>
                            <Phone size={16} />
                            Call
                          </a>
                        ) : null}
                        {item.status !== 'contacted' ? (
                          <button
                            className="admin-action-button success"
                            disabled={updatingId === item._id}
                            onClick={() => updateStatus(item._id, 'contacted')}
                          >
                            <ShieldCheck size={16} />
                            {updatingId === item._id ? 'Updating...' : 'Mark Contacted'}
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
          <div className="modal-content" style={{ maxWidth: 760 }} onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Service Request Details</h2>
              <button className="close-btn" onClick={() => setSelectedRequest(null)}>×</button>
            </div>
            <div className="modal-body" style={{ display: 'grid', gap: 18 }}>
              <div className="admin-info-grid">
                <div className="admin-info-card">
                  <span className="admin-info-label">Patient Name</span>
                  <div className="admin-info-value">{selectedRequest.name}</div>
                </div>
                <div className="admin-info-card">
                  <span className="admin-info-label">Patient Mobile</span>
                  <div className="admin-info-value">{selectedRequest.mobileNumber}</div>
                </div>
                <div className="admin-info-card">
                  <span className="admin-info-label">Request Type</span>
                  <div className="admin-info-value">{requestForLabel(selectedRequest)}</div>
                </div>
                <div className="admin-info-card">
                  <span className="admin-info-label">Requester Name</span>
                  <div className="admin-info-value">{selectedRequest.requesterName || selectedRequest.name}</div>
                </div>
                <div className="admin-info-card">
                  <span className="admin-info-label">Requester Mobile</span>
                  <div className="admin-info-value">{selectedRequest.requesterMobileNumber || selectedRequest.mobileNumber}</div>
                </div>
                <div className="admin-info-card">
                  <span className="admin-info-label">Lead Source</span>
                  <div className="admin-info-value">{leadSourceLabel(selectedRequest.leadSource)}</div>
                </div>
                <div className="admin-info-card">
                  <span className="admin-info-label">Service Type</span>
                  <div className="admin-info-value">{titleCase(selectedRequest.serviceType)}</div>
                </div>
                <div className="admin-info-card">
                  <span className="admin-info-label">Service Title</span>
                  <div className="admin-info-value">{selectedRequest.serviceTitle || '-'}</div>
                </div>
                <div className="admin-info-card">
                  <span className="admin-info-label">Provider</span>
                  <div className="admin-info-value">{selectedRequest.providerName || 'Support contact'}</div>
                </div>
                <div className="admin-info-card">
                  <span className="admin-info-label">Provider Phone</span>
                  <div className="admin-info-value">{selectedRequest.providerPhone || '-'}</div>
                </div>
                <div className="admin-info-card">
                  <span className="admin-info-label">Generated OTP</span>
                  <div className="admin-info-value">{selectedRequest.requestOtp}</div>
                </div>
                <div className="admin-info-card">
                  <span className="admin-info-label">Preferred Date</span>
                  <div className="admin-info-value">{selectedRequest.preferredDate || '-'}</div>
                </div>
                <div className="admin-info-card">
                  <span className="admin-info-label">Preferred Time</span>
                  <div className="admin-info-value">{selectedRequest.preferredTime || '-'}</div>
                </div>
                <div className="admin-info-card">
                  <span className="admin-info-label">City</span>
                  <div className="admin-info-value">{selectedRequest.city || '-'}</div>
                </div>
                <div className="admin-info-card" style={{ gridColumn: '1 / -1' }}>
                  <span className="admin-info-label">Address</span>
                  <div className="admin-info-value">{selectedRequest.address || '-'}</div>
                </div>
                <div className="admin-info-card">
                  <span className="admin-info-label">Status</span>
                  <div className="admin-info-value">{titleCase(selectedRequest.status)}</div>
                </div>
                <div className="admin-info-card">
                  <span className="admin-info-label">Requested At</span>
                  <div className="admin-info-value">{formatDateTime(selectedRequest.createdAt)}</div>
                </div>
                <div className="admin-info-card">
                  <span className="admin-info-label">Updated At</span>
                  <div className="admin-info-value">{formatDateTime(selectedRequest.updatedAt)}</div>
                </div>
                {selectedRequest.notes ? (
                  <div className="admin-info-card" style={{ gridColumn: '1 / -1' }}>
                    <span className="admin-info-label">Notes</span>
                    <div className="admin-info-value">{selectedRequest.notes}</div>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <div className="admin-panel-actions">
                {selectedRequest.providerPhone ? (
                  <a className="admin-action-button secondary" href={`tel:${selectedRequest.providerPhone}`}>
                    <Phone size={16} />
                    Call Provider
                  </a>
                ) : null}
                <a className="admin-action-button secondary" href={`tel:${selectedRequest.mobileNumber}`}>
                  <Phone size={16} />
                  Call Patient
                </a>
              </div>
              <div className="admin-panel-actions">
                {selectedRequest.status !== 'contacted' ? (
                  <button
                    className="admin-action-button success"
                    disabled={updatingId === selectedRequest._id}
                    onClick={() => updateStatus(selectedRequest._id, 'contacted')}
                  >
                    <ShieldCheck size={16} />
                    {updatingId === selectedRequest._id ? 'Updating...' : 'Mark Contacted'}
                  </button>
                ) : null}
                {selectedRequest.status !== 'closed' ? (
                  <button
                    className="admin-action-button"
                    disabled={updatingId === selectedRequest._id}
                    onClick={() => updateStatus(selectedRequest._id, 'closed')}
                  >
                    <CheckCircle2 size={16} />
                    {updatingId === selectedRequest._id ? 'Updating...' : 'Close Request'}
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

export default ServiceRequestsPage;
