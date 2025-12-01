import React, { useCallback, useEffect, useState } from 'react';
import { FileText, Check, X, Eye } from 'lucide-react';
import { apiRequest } from '../../utils/api';

const normalizeDoctor = (verification) => ({
  id: verification._id,
  type: 'doctor',
  title: verification.personalDetails?.fullName || 'Doctor',
  subtitle: verification.personalDetails?.medicalSpecialization || 'Doctor License',
  date: verification.createdAt,
  status: verification.status,
  badge: 'Doctor verification',
});

const normalizePharmacy = (verification) => ({
  id: verification._id,
  type: 'pharmacy',
  title: verification.pharmacy?.name || 'Pharmacy',
  subtitle: verification.pharmacy?.registrationId
    ? `Registration · ${verification.pharmacy.registrationId}`
    : 'Business registration',
  date: verification.createdAt,
  status: verification.status,
  badge: 'Pharmacy verification',
});

const VerificationList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [doctorRes, pharmacyRes] = await Promise.all([
        apiRequest('/api/admin/verifications?type=doctor&status=pending&limit=10'),
        apiRequest('/api/admin/verifications?type=pharmacy&status=pending&limit=10'),
      ]);

      const doctorRequests = Array.isArray(doctorRes?.data?.verifications)
        ? doctorRes.data.verifications.map((req) => normalizeDoctor(req))
        : [];
      const pharmacyRequests = Array.isArray(pharmacyRes?.data?.verifications)
        ? pharmacyRes.data.verifications.map((req) => normalizePharmacy(req))
        : [];

      const combined = [...doctorRequests, ...pharmacyRequests];
      combined.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRequests(combined);
    } catch (err) {
      setError(err?.message || 'Unable to load verification requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleAction = async (request, action) => {
    if (action === 'Reject') {
      const note = prompt('Enter rejection reason:');
      if (!note) return;
      try {
        await apiRequest(
          `/api/${request.type === 'doctor' ? 'admin/doctors/verification' : 'admin/pharmacies/verification'}/${request.id}/reject`,
          {
            method: 'PUT',
            body: { rejectionReason: note },
          }
        );
        setRequests((prev) => prev.filter((req) => req.id !== request.id));
        alert('Request rejected successfully.');
        return;
      } catch (err) {
        alert(err?.message || 'Unable to reject verification');
        return;
      }
    }

    try {
      await apiRequest(
        `/api/${request.type === 'doctor' ? 'admin/doctors/verification' : 'admin/pharmacies/verification'}/${request.id}/approve`,
        {
          method: 'PUT',
        }
      );
      setRequests((prev) => prev.filter((req) => req.id !== request.id));
      alert('Request approved successfully.');
    } catch (err) {
      alert(err?.message || 'Unable to approve verification');
    }
  };

  const handleView = (request) => {
    alert(`Verification ID: ${request.id}\nType: ${request.badge}`);
  };

  return (
    <div style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#1E40AF' }}>
            Verification
          </p>
          <h1 style={{ margin: '4px 0 6px', fontSize: 28, fontWeight: 800, color: '#0f172a' }}>Document Verification</h1>
          <p style={{ margin: 0, color: '#475569' }}>Review, approve, or reject pending verification requests.</p>
        </div>
      </div>

      {loading && <p style={{ color: '#475569' }}>Loading verification requests…</p>}
      {error && (
        <div style={{ marginBottom: 16, padding: 12, borderRadius: 10, background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {requests.map((req) => (
          <div
            key={`${req.type}-${req.id}`}
            style={{
              background: '#fff',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              boxShadow: '0 8px 24px rgba(2,6,23,0.06)',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ padding: 10, borderRadius: 10, background: '#eff6ff', color: '#1d4ed8' }}>
                  <FileText size={22} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#f59e0b' }}>
                    {req.status}
                  </p>
                  <h3 style={{ margin: '4px 0 2px', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{req.title}</h3>
                  <p style={{ margin: 0, color: '#475569', fontSize: 13 }}>
                    {req.subtitle} · {req.date ? new Date(req.date).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: '#fffbeb',
                  color: '#d97706',
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                {req.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 6 }}>
              <button
                onClick={() => handleView(req)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#0f172a',
                  fontWeight: 600,
                  display: 'inline-flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <Eye size={16} /> View
              </button>
              <button
                onClick={() => handleAction(req, 'Reject')}
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #fecaca',
                  background: '#fee2e2',
                  color: '#b91c1c',
                  fontWeight: 700,
                  display: 'inline-flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <X size={16} /> Reject
              </button>
              <button
                onClick={() => handleAction(req, 'Approve')}
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #a7f3d0',
                  background: '#d1fae5',
                  color: '#047857',
                  fontWeight: 700,
                  display: 'inline-flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 10px rgba(16,185,129,0.12)',
                }}
              >
                <Check size={16} /> Approve
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && requests.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8', marginTop: 20, background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <p style={{ margin: 0 }}>No pending verifications.</p>
        </div>
      )}
    </div>
  );
};

export default VerificationList;
