import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, FileText, Calendar, MapPin, User, Phone, Mail, Award } from 'lucide-react';
import { apiRequest, pickList } from '../../utils/api';
import { useApiData } from '../../hooks/useApiData';
import './doctors-page.css';

const ItemRow = ({ icon: Icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
    {Icon && <Icon size={14} className="text-gray-400" />}
    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
      <span style={{ fontWeight: 600, color: 'var(--text-primary)', marginRight: 4 }}>{label}:</span>
      {value || '-'}
    </p>
  </div>
);

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
};

const normalizeVerification = (item, idx) => ({
  id: item._id || item.id || idx + 1,
  doctorId: item.doctor?._id || item.doctor || '-',
  fullName: item.personalDetails?.fullName || item.fullName || item.name || '-',
  email: item.personalDetails?.email || item.email || '-',
  phoneNumber: item.personalDetails?.phoneNumber || item.phoneNumber || '-',
  medicalSpecialization: item.personalDetails?.medicalSpecialization || item.medicalSpecialization || '-',
  yearsOfExperience: item.personalDetails?.yearsOfExperience ?? item.yearsOfExperience ?? '-',
  clinicHospitalName: item.personalDetails?.clinicHospitalName || item.clinicHospitalName || item.clinicName || '-',
  clinicAddress: item.personalDetails?.clinicAddress || item.clinicAddress || item.address || '-',
  state: item.personalDetails?.state || item.state || '-',
  city: item.personalDetails?.city || item.city || '-',
  registrationNumber: item.registration?.registrationNumber || item.registrationNumber || '-',
  councilName: item.registration?.councilName || item.councilName || '-',
  issueDate: formatDate(item.registration?.issueDate || item.issueDate),
  documentType: item.identity?.documentType || item.documentType || '-',
  status: item.status || 'pending',
  submitted: formatDate(item.createdAt || item.submitted),
  files: {
    mbbsCertificate: item.qualifications?.mbbsCertificate?.path || item.mbbsCertificate,
    mdMsBdsCertificate: item.qualifications?.mdMsBdsCertificate?.path || item.mdMsBdsCertificate,
    registrationCertificate: item.registration?.registrationCertificate?.path || item.registrationCertificate,
    governmentId: item.identity?.governmentId?.path || item.governmentId,
    selfie: item.selfieVerification?.selfie?.path || item.selfie
  }
});

const DoctorNewVerification = () => {
  const [actionLoading, setActionLoading] = useState('');
  const [actionError, setActionError] = useState('');
  const { data, setData, loading, error } = useApiData(async () => {
    const payload = await apiRequest('/api/admin/verifications?status=pending');
    const list = pickList(payload);
    return list.map(normalizeVerification);
  }, []);

  const items = data;

  const removeFromList = (verificationId) => {
    setData((prev) => prev.filter((item) => item.id !== verificationId));
  };

  const updateLocalStatus = (verificationId, status, extra = {}) => {
    // For approve/reject, remove from list since this page only shows pending
    if (status === 'approved' || status === 'rejected') {
      removeFromList(verificationId);
    } else {
      // For under_review, just update the status badge
      setData((prev) =>
        prev.map((item) =>
          item.id === verificationId
            ? { ...item, status, ...extra }
            : item
        )
      );
    }
  };

  const handleAction = async (verificationId, type) => {
    setActionError('');
    setActionLoading(verificationId);
    try {
      if (type === 'approve') {
        await apiRequest(`/api/admin/doctors/verification/${verificationId}/approve`, {
          method: 'PUT'
        });
        updateLocalStatus(verificationId, 'approved');
      } else if (type === 'reject') {
        const reason = window.prompt('Enter rejection reason (optional):', 'Incomplete documents');
        await apiRequest(`/api/admin/doctors/verification/${verificationId}/reject`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: { rejectionReason: reason || 'Rejected by admin', adminNotes: reason || '' }
        });
        updateLocalStatus(verificationId, 'rejected', { rejectionReason: reason || '' });
      } else if (type === 'under_review') {
        await apiRequest(`/api/admin/doctors/verification/${verificationId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: { status: 'under_review' }
        });
        updateLocalStatus(verificationId, 'under_review');
      }
    } catch (err) {
      setActionError(err?.message || 'Action failed');
    } finally {
      setActionLoading('');
    }
  };

  return (
    <div className="doctors-page">
      <div className="page-header">
        <h1 className="page-title">New Doctor Verifications</h1>
        <p className="page-subtitle">Review and manage pending doctor verification requests.</p>
      </div>

      {error && <div className="error-state">{error}</div>}
      {actionError && <div className="error-state" style={{ padding: 12, marginBottom: 16 }}>{actionError}</div>}

      {loading ? (
        <div className="loading-state">Loading verifications...</div>
      ) : items.length === 0 ? (
        <div className="empty-state">No pending verifications found.</div>
      ) : (
        <div style={{ display: 'grid', gap: 24 }}>
          {items.map((item) => (
            <div key={item.id} className="table-container" style={{ padding: 24, overflow: 'visible' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div className="doctor-avatar" style={{ width: 64, height: 64, fontSize: 24 }}>
                    {item.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{item.fullName}</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14 }}>{item.medicalSpecialization} • Submitted {item.submitted}</p>
                    <div style={{ marginTop: 8 }}>
                      <span className={`status-badge status-${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleAction(item.id, 'approve')}
                    disabled={!!actionLoading}
                    className="action-btn"
                    style={{ background: 'var(--success-light)', color: '#065f46', border: '1px solid var(--success)', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px' }}
                  >
                    <CheckCircle size={16} />
                    {actionLoading === item.id ? '...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleAction(item.id, 'reject')}
                    disabled={!!actionLoading}
                    className="action-btn"
                    style={{ background: 'var(--danger-light)', color: '#991b1b', border: '1px solid var(--danger)', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px' }}
                  >
                    <XCircle size={16} />
                    {actionLoading === item.id ? '...' : 'Reject'}
                  </button>
                  <button
                    onClick={() => handleAction(item.id, 'under_review')}
                    disabled={!!actionLoading}
                    className="action-btn"
                    style={{ background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px' }}
                  >
                    <AlertCircle size={16} />
                    {actionLoading === item.id ? '...' : 'Review'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <User size={16} /> Personal Details
                  </h4>
                  <ItemRow icon={Mail} label="Email" value={item.email} />
                  <ItemRow icon={Phone} label="Phone" value={item.phoneNumber} />
                  <ItemRow icon={MapPin} label="Address" value={[item.clinicAddress, item.city, item.state].filter(Boolean).join(', ')} />
                </div>

                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Award size={16} /> Professional Info
                  </h4>
                  <ItemRow icon={Award} label="Experience" value={item.yearsOfExperience !== undefined ? `${item.yearsOfExperience} yrs` : '-'} />
                  <ItemRow icon={MapPin} label="Clinic" value={item.clinicHospitalName} />
                  <ItemRow icon={FileText} label="Reg. No" value={item.registrationNumber} />
                  <ItemRow icon={FileText} label="Council" value={item.councilName} />
                  <ItemRow icon={Calendar} label="Issue Date" value={item.issueDate} />
                </div>

                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={16} /> Documents
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <FileLink label="MBBS Cert" href={item.files.mbbsCertificate} />
                    <FileLink label="MD/MS/BDS" href={item.files.mdMsBdsCertificate} />
                    <FileLink label="Reg. Cert" href={item.files.registrationCertificate} />
                    <FileLink label="Govt ID" href={item.files.governmentId} />
                    <FileLink label="Selfie" href={item.files.selfie} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FileLink = ({ label, href }) => {
  if (!href) {
    return (
      <span style={{
        padding: '6px 12px',
        borderRadius: 6,
        border: '1px dashed var(--border)',
        background: '#f9fafb',
        color: 'var(--text-tertiary)',
        fontSize: 12,
        fontWeight: 500
      }}>
        {label}
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{
        padding: '6px 12px',
        borderRadius: 6,
        border: '1px solid var(--border)',
        background: '#fff',
        color: 'var(--primary)',
        textDecoration: 'none',
        fontSize: 12,
        fontWeight: 500,
        transition: 'all 0.2s'
      }}
      onMouseOver={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = '#f5f3ff'; }}
      onMouseOut={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = '#fff'; }}
    >
      {label}
    </a>
  );
};

export default DoctorNewVerification;
