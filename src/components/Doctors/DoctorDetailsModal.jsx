import React from 'react';
import { X, User, Mail, Phone, MapPin, Award, FileText, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';

const DoctorDetailsModal = ({ doctor, onClose }) => {
  if (!doctor) return null;

  // Helper to safely access nested properties
  const getVal = (val, fallback = '-') => val || fallback;
  const formatDate = (val) => {
    if (!val) return '-';
    const d = new Date(val);
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
  };

  // Normalize data structure depending on source (Verification object vs Doctor object)
  // Verification objects have personalDetails, etc.
  // Doctor objects might have direct fields.
  // We'll try to handle both or assume a normalized structure passed in.

  const d = doctor;
  const personal = d.personalDetails || {};
  const registration = d.registration || {};
  const qualifications = d.qualifications || {};
  const identity = d.identity || {};

  const getFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    // Remove leading slash if present to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${API_BASE_URL}/${cleanPath}`;
  };

  const files = {
    mbbs: getFileUrl(qualifications.mbbsCertificate?.path || d.mbbsCertificate),
    mdMs: getFileUrl(qualifications.mdMsBdsCertificate?.path || d.mdMsBdsCertificate),
    reg: getFileUrl(registration.registrationCertificate?.path || d.registrationCertificate),
    govt: getFileUrl(identity.governmentId?.path || d.governmentId),
    selfie: getFileUrl(d.selfieVerification?.selfie?.path || d.selfie)
  };

  // Fallback for Doctor object structure (if different from Verification)
  const name = personal.fullName || d.name || d.fullName || 'Unknown';
  const email = personal.email || d.email || '-';
  const phone = personal.phoneNumber || d.phoneNumber || '-';
  const specialization = personal.medicalSpecialization || d.specialization || d.medicalSpecialization || '-';
  const experience = personal.yearsOfExperience ?? d.experienceYears ?? d.yearsOfExperience ?? '-';
  const clinic = personal.clinicHospitalName || d.clinicHospitalName || d.clinicName || '-';
  const address = personal.clinicAddress || d.clinicAddress || d.address || d.city || '-';
  const regNo = registration.registrationNumber || d.registrationNumber || '-';
  const council = registration.councilName || d.councilName || '-';
  const issueDate = formatDate(registration.issueDate || d.issueDate);
  const status = d.status || (d.isActive ? 'Active' : 'Inactive');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Doctor Details</h2>
            <p className="modal-subtitle">Complete information for {name}</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Header Card */}
          <div className="detail-card header-card">
            <div className="doctor-avatar-large">
              {name.charAt(0)}
            </div>
            <div className="header-info">
              <h3>{name}</h3>
              <p>{specialization}</p>
              <div className={`status-badge status-${status.toLowerCase()}`}>
                {status}
              </div>
            </div>
          </div>

          <div className="details-grid">
            {/* Personal Info */}
            <div className="detail-section">
              <h4><User size={16} /> Personal Information</h4>
              <div className="info-row">
                <span className="label">Email:</span>
                <span className="value">{email}</span>
              </div>
              <div className="info-row">
                <span className="label">Phone:</span>
                <span className="value">{phone}</span>
              </div>
              <div className="info-row">
                <span className="label">Address:</span>
                <span className="value">{address}</span>
              </div>
            </div>

            {/* Professional Info */}
            <div className="detail-section">
              <h4><Award size={16} /> Professional Details</h4>
              <div className="info-row">
                <span className="label">Experience:</span>
                <span className="value">{experience} years</span>
              </div>
              <div className="info-row">
                <span className="label">Clinic/Hospital:</span>
                <span className="value">{clinic}</span>
              </div>
              <div className="info-row">
                <span className="label">Registration No:</span>
                <span className="value">{regNo}</span>
              </div>
              <div className="info-row">
                <span className="label">Council:</span>
                <span className="value">{council}</span>
              </div>
              <div className="info-row">
                <span className="label">Issue Date:</span>
                <span className="value">{issueDate}</span>
              </div>
            </div>

            {/* Documents */}
            <div className="detail-section full-width">
              <h4><FileText size={16} /> Documents</h4>
              <div className="files-grid">
                <FileItem label="MBBS Certificate" url={files.mbbs} />
                <FileItem label="MD/MS/BDS Cert" url={files.mdMs} />
                <FileItem label="Registration Cert" url={files.reg} />
                <FileItem label="Government ID" url={files.govt} />
                <FileItem label="Selfie" url={files.selfie} />
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>


    </div>
  );
};

const FileItem = ({ label, url }) => {
  if (!url) return <span className="file-item disabled">{label} (Not uploaded)</span>;
  return <a href={url} target="_blank" rel="noreferrer" className="file-item">{label}</a>;
};

export default DoctorDetailsModal;
