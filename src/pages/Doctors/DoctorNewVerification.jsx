import React, { useState } from 'react';

import { apiRequest, pickList } from '../../utils/api';
import { useApiData } from '../../hooks/useApiData';

const ItemRow = ({ label, value }) => (
  <p style={{ margin: '2px 0', color: '#475569', fontSize: 13 }}>
    <span style={{ fontWeight: 700, color: '#0f172a' }}>{label}:</span> {value || '-'}
  </p>
);

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toISOString().slice(0, 10);
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
    const payload = await apiRequest('/api/doctors/verification?status=pending');
    const list = pickList(payload);
    return list.map(normalizeVerification);
  }, []);

  const items = data;

  const updateLocalStatus = (verificationId, status, extra = {}) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === verificationId
          ? { ...item, status, ...extra }
          : item
      )
    );
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
    <div style={{ padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(2,6,23,0.06)', padding: 16 }}>
        <h2 style={{ margin: '0 0 12px', color: '#0f172a' }}>New Doctor Verifications</h2>
        <p style={{ margin: '0 0 12px', color: '#475569' }}>
          Pending verification submissions pulled from the Doorspital API{loading ? ' (loading...)' : ''}.
        </p>

        {error && (
          <div style={errorBoxStyle}>
            {error} (showing local fallback data if available)
          </div>
        )}
        {actionError && (
          <div style={errorBoxStyle}>
            {actionError}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b' }}>
            <p style={{ fontSize: 16, fontWeight: 500 }}>No pending verifications found</p>
            <p style={{ fontSize: 14, marginTop: 4 }}>New verification requests will appear here.</p>
          </div>
        )}

        <div style={{ display: 'grid', gap: 12 }}>
          {items.map((item) => (
            <div key={item.id} style={{ padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', display: 'grid', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>{item.fullName}</p>
                  <p style={{ margin: '2px 0 0', color: '#475569' }}>{item.medicalSpecialization} · Submitted {item.submitted}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ padding: '4px 10px', borderRadius: 999, background: '#fffbeb', color: '#d97706', fontSize: 12, fontWeight: 700 }}>
                    {item.status || 'Pending'}
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => handleAction(item.id, 'approve')}
                      disabled={!!actionLoading}
                      style={actionBtnStyle('#10b981', '#ecfdf3')}
                    >
                      {actionLoading === item.id ? '...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleAction(item.id, 'reject')}
                      disabled={!!actionLoading}
                      style={actionBtnStyle('#ef4444', '#fef2f2')}
                    >
                      {actionLoading === item.id ? '...' : 'Reject'}
                    </button>
                    <button
                      onClick={() => handleAction(item.id, 'under_review')}
                      disabled={!!actionLoading}
                      style={actionBtnStyle('#3b82f6', '#eff6ff')}
                    >
                      {actionLoading === item.id ? '...' : 'Under review'}
                    </button>
                  </div>
                </div>
              </div>
              <ItemRow label="Doctor ID" value={item.doctorId} />
              <ItemRow label="Email" value={item.email} />
              <ItemRow label="Phone" value={item.phoneNumber} />
              <ItemRow label="Experience" value={item.yearsOfExperience !== undefined ? `${item.yearsOfExperience} yrs` : '-'} />
              <ItemRow label="Clinic/Hospital" value={item.clinicHospitalName} />
              <ItemRow label="Address" value={[item.clinicAddress, item.city, item.state].filter(Boolean).join(', ')} />
              <ItemRow label="Registration No." value={item.registrationNumber} />
              <ItemRow label="Council" value={item.councilName} />
              <ItemRow label="Issue Date" value={item.issueDate} />
              <ItemRow label="ID Type" value={item.documentType} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                <FileLink label="MBBS Certificate" href={item.files.mbbsCertificate} />
                <FileLink label="MD/MS/BDS" href={item.files.mdMsBdsCertificate} />
                <FileLink label="Registration Cert" href={item.files.registrationCertificate} />
                <FileLink label="Govt ID" href={item.files.governmentId} />
                <FileLink label="Selfie" href={item.files.selfie} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const FileLink = ({ label, href }) => {
  if (!href) {
    return (
      <span style={{ ...linkStyle, color: '#94a3b8', borderStyle: 'dashed' }}>
        {label}
      </span>
    );
  }
  return (
    <a style={linkStyle} href={href} target="_blank" rel="noreferrer">
      {label}
    </a>
  );
};

const linkStyle = {
  padding: '6px 10px',
  borderRadius: 6,
  border: '1px solid #e2e8f0',
  background: '#fff',
  color: '#0f172a',
  textDecoration: 'none',
  fontSize: 12,
  fontWeight: 600
};

const errorBoxStyle = {
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid #fecaca',
  background: '#fee2e2',
  color: '#991b1b',
  marginBottom: 12,
  fontSize: 14
};

const actionBtnStyle = (color, bg) => ({
  padding: '6px 10px',
  borderRadius: 6,
  border: `1px solid ${color}`,
  background: bg,
  color,
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer'
});

export default DoctorNewVerification;
