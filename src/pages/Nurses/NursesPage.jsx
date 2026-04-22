import React, { useEffect, useMemo, useState } from 'react';
import {
  BadgePlus,
  Clock3,
  Eye,
  FileText,
  Mail,
  MapPin,
  Phone,
  Save,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';
import { apiRequest, pickList } from '../../utils/api';
import '../../styles/admin-panel.css';

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.42)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
  zIndex: 1000,
};

const modalStyle = {
  width: 'min(1100px, 100%)',
  maxHeight: 'calc(100vh - 48px)',
  overflow: 'auto',
  background: '#fff',
  borderRadius: 28,
  border: '1px solid #dbeafe',
  boxShadow: '0 30px 80px rgba(15, 23, 42, 0.16)',
};

const sectionTitleStyle = {
  margin: 0,
  fontSize: 13,
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#64748b',
};

const fieldStyle = {
  width: '100%',
  borderRadius: 16,
  border: '1px solid #e2e8f0',
  background: '#fff',
  padding: '12px 14px',
  fontSize: 14,
  color: '#0f172a',
  outline: 'none',
};

const textareaStyle = {
  ...fieldStyle,
  minHeight: 96,
  resize: 'vertical',
};

const defaultForm = {
  fullName: '',
  email: '',
  password: '',
  phoneNumber: '',
  gender: 'prefer_not_to_say',
  qualificationLevel: 'GNM',
  experienceYears: '',
  specialization: '',
  services: '',
  registrationNumber: '',
  nursingCouncilName: '',
  governmentIdType: 'Aadhaar Card',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  status: 'active',
  statusReason: '',
  anmCertificate: null,
  gnmCertificate: null,
  bsnCertificate: null,
  registrationCertificate: null,
  governmentId: null,
  profilePhoto: null,
};

const qualificationOptions = ['ANM', 'GNM', 'BSN', 'Other'];
const statusOptions = ['active', 'pending', 'suspended'];
const governmentIdOptions = ['Aadhaar Card', 'PAN Card', 'Passport', 'Driving License', 'Voter ID'];

const resolveFileUrl = (file) => {
  if (!file) return '';
  if (typeof file === 'string') return file;
  return file.url || file.path || '';
};

const formatStatus = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return 'Pending';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const buildInitials = (name) =>
  String(name || '')
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'N';

const mapNurseToForm = (nurse) => ({
  fullName: nurse?.fullName || nurse?.user?.userName || '',
  email: nurse?.user?.email || '',
  password: '',
  phoneNumber: nurse?.phoneNumber || nurse?.user?.phoneNumber || '',
  gender: nurse?.gender || 'prefer_not_to_say',
  qualificationLevel: nurse?.qualificationLevel || 'GNM',
  experienceYears:
    typeof nurse?.experienceYears === 'number' ? String(nurse.experienceYears) : '',
  specialization: nurse?.specialization || '',
  services: Array.isArray(nurse?.services) ? nurse.services.join(', ') : '',
  registrationNumber: nurse?.registrationNumber || '',
  nursingCouncilName: nurse?.nursingCouncilName || '',
  governmentIdType: nurse?.governmentIdType || 'Aadhaar Card',
  line1: nurse?.address?.line1 || '',
  line2: nurse?.address?.line2 || '',
  city: nurse?.address?.city || '',
  state: nurse?.address?.state || '',
  pincode: nurse?.address?.pincode || '',
  status: nurse?.status || 'active',
  statusReason: nurse?.statusReason || '',
  anmCertificate: null,
  gnmCertificate: null,
  bsnCertificate: null,
  registrationCertificate: null,
  governmentId: null,
  profilePhoto: null,
});

const NurseDetailsModal = ({ nurse, onClose, onEdit, onStatusChange, statusLoading }) => {
  if (!nurse) return null;

  const docs = nurse.documents || {};
  const statusTone =
    nurse.status === 'active' ? 'success' : nurse.status === 'suspended' ? 'danger' : 'secondary';

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(event) => event.stopPropagation()}>
        <div style={{ padding: 28, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div className="admin-panel-avatar" style={{ width: 68, height: 68, borderRadius: 22, overflow: 'hidden' }}>
              {resolveFileUrl(docs.profilePhoto) || nurse.user?.avatarUrl ? (
                <img
                  src={resolveFileUrl(docs.profilePhoto) || nurse.user?.avatarUrl}
                  alt={nurse.fullName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                buildInitials(nurse.fullName)
              )}
            </div>
            <div>
              <div className="admin-panel-kicker" style={{ marginBottom: 8 }}>
                <BadgePlus size={14} />
                Nurse Profile
              </div>
              <h2 className="admin-panel-title" style={{ fontSize: 28 }}>
                {nurse.fullName}
              </h2>
              <p className="admin-panel-subtitle" style={{ marginTop: 6 }}>
                {nurse.qualificationLevel} | {nurse.specialization || 'General nursing support'} |{' '}
                {nurse.address?.city || '-'}, {nurse.address?.state || '-'}
              </p>
            </div>
          </div>

          <button className="admin-action-button secondary" onClick={onClose}>
            <X size={16} />
            Close
          </button>
        </div>

        <div style={{ padding: 28, display: 'grid', gap: 20 }}>
          <div className="admin-panel-actions">
            <span className={`admin-action-button ${statusTone}`} style={{ cursor: 'default' }}>
              <ShieldCheck size={16} />
              {formatStatus(nurse.status)}
            </span>
            <button className="admin-action-button" onClick={() => onEdit(nurse)}>
              <Save size={16} />
              Edit
            </button>
            {nurse.status !== 'active' && (
              <button
                className="admin-action-button success"
                disabled={statusLoading}
                onClick={() => onStatusChange(nurse, 'active')}
              >
                <ShieldCheck size={16} />
                Activate
              </button>
            )}
            {nurse.status !== 'pending' && (
              <button
                className="admin-action-button secondary"
                disabled={statusLoading}
                onClick={() => onStatusChange(nurse, 'pending')}
              >
                <Clock3 size={16} />
                Set Pending
              </button>
            )}
            {nurse.status !== 'suspended' && (
              <button
                className="admin-action-button danger"
                disabled={statusLoading}
                onClick={() => onStatusChange(nurse, 'suspended')}
              >
                <X size={16} />
                Suspend
              </button>
            )}
          </div>

          <div className="admin-info-grid">
            <div className="admin-info-card">
              <span className="admin-info-label">Email</span>
              <div className="admin-info-value">{nurse.user?.email || '-'}</div>
            </div>
            <div className="admin-info-card">
              <span className="admin-info-label">Phone</span>
              <div className="admin-info-value">{nurse.phoneNumber || '-'}</div>
            </div>
            <div className="admin-info-card">
              <span className="admin-info-label">Experience</span>
              <div className="admin-info-value">{nurse.experienceYears || 0} years</div>
            </div>
            <div className="admin-info-card">
              <span className="admin-info-label">Registration Number</span>
              <div className="admin-info-value">{nurse.registrationNumber || '-'}</div>
            </div>
            <div className="admin-info-card">
              <span className="admin-info-label">Council</span>
              <div className="admin-info-value">{nurse.nursingCouncilName || '-'}</div>
            </div>
            <div className="admin-info-card">
              <span className="admin-info-label">Government ID Type</span>
              <div className="admin-info-value">{nurse.governmentIdType || '-'}</div>
            </div>
            <div className="admin-info-card" style={{ gridColumn: '1 / -1' }}>
              <span className="admin-info-label">Services</span>
              <div className="admin-info-value">
                {nurse.services?.length ? nurse.services.join(', ') : 'No services added'}
              </div>
            </div>
            <div className="admin-info-card" style={{ gridColumn: '1 / -1' }}>
              <span className="admin-info-label">Address</span>
              <div className="admin-info-value">
                {[nurse.address?.line1, nurse.address?.line2, nurse.address?.city, nurse.address?.state, nurse.address?.pincode]
                  .filter(Boolean)
                  .join(', ') || '-'}
              </div>
            </div>
            <div className="admin-info-card" style={{ gridColumn: '1 / -1' }}>
              <span className="admin-info-label">Admin Note</span>
              <div className="admin-info-value">{nurse.statusReason || 'No admin note added.'}</div>
            </div>
          </div>

          <div className="admin-panel-card" style={{ padding: 20 }}>
            <h3 style={{ ...sectionTitleStyle, marginBottom: 14 }}>Uploaded Documents</h3>
            <div className="admin-panel-actions">
              {[
                ['ANM Certificate', docs.anmCertificate],
                ['GNM Certificate', docs.gnmCertificate],
                ['BSN Certificate', docs.bsnCertificate],
                ['Registration Certificate', docs.registrationCertificate],
                ['Government ID', docs.governmentId],
                ['Profile Photo', docs.profilePhoto],
              ].map(([label, file]) => {
                const href = resolveFileUrl(file);
                return href ? (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-action-button secondary"
                  >
                    <FileText size={16} />
                    {label}
                  </a>
                ) : (
                  <span key={label} className="admin-action-button secondary" style={{ opacity: 0.6, cursor: 'default' }}>
                    <FileText size={16} />
                    {label} Missing
                  </span>
                );
              })}
            </div>
          </div>

          <div className="admin-panel-card" style={{ padding: 20 }}>
            <h3 style={{ ...sectionTitleStyle, marginBottom: 14 }}>Status Timeline</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              {(nurse.statusHistory || []).length ? (
                [...nurse.statusHistory].reverse().map((entry, index) => (
                  <div
                    key={`${entry.changedAt || index}-${index}`}
                    style={{
                      padding: 14,
                      borderRadius: 16,
                      border: '1px solid #e2e8f0',
                      background: '#f8fbff',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>
                      {formatStatus(entry.toStatus)}
                    </div>
                    <div style={{ marginTop: 4, fontSize: 13, color: '#475569' }}>
                      {entry.reason || 'No reason added'}
                    </div>
                    <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
                      {entry.changedAt
                        ? new Date(entry.changedAt).toLocaleString('en-IN')
                        : 'Time not available'}
                      {entry.changedBy?.userName ? ` | ${entry.changedBy.userName}` : ''}
                    </div>
                  </div>
                ))
              ) : (
                <div className="admin-panel-empty" style={{ padding: 20 }}>
                  No status history yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NurseFormModal = ({ mode, form, setForm, saving, onClose, onSubmit }) => {
  const isEdit = mode === 'edit';

  const setField = (field) => (event) => {
    const value = event.target.type === 'file' ? event.target.files?.[0] || null : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(event) => event.stopPropagation()}>
        <div style={{ padding: 28, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div className="admin-panel-kicker">
              <BadgePlus size={14} />
              Nurse Onboarding
            </div>
            <h2 className="admin-panel-title" style={{ fontSize: 28 }}>
              {isEdit ? 'Edit Nurse Profile' : 'Add New Nurse'}
            </h2>
            <p className="admin-panel-subtitle">
              Add nursing staff with full qualification, registration, and identity documents.
            </p>
          </div>
          <button className="admin-action-button secondary" onClick={onClose}>
            <X size={16} />
            Close
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ padding: 28, display: 'grid', gap: 24 }}>
          <div style={{ display: 'grid', gap: 16 }}>
            <h3 style={sectionTitleStyle}>Basic Details</h3>
            <div className="admin-info-grid">
              <input style={fieldStyle} placeholder="Full name" value={form.fullName} onChange={setField('fullName')} required />
              <input style={fieldStyle} type="email" placeholder="Email address" value={form.email} onChange={setField('email')} required />
              <input style={fieldStyle} type="password" placeholder={isEdit ? 'Change password (optional)' : 'Password'} value={form.password} onChange={setField('password')} required={!isEdit} />
              <input style={fieldStyle} placeholder="Phone number" value={form.phoneNumber} onChange={setField('phoneNumber')} required />
              <select style={fieldStyle} value={form.gender} onChange={setField('gender')}>
                <option value="prefer_not_to_say">Prefer not to say</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
              <select style={fieldStyle} value={form.status} onChange={setField('status')}>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {formatStatus(option)}
                  </option>
                ))}
              </select>
            </div>
            <textarea style={textareaStyle} placeholder="Admin note / onboarding note" value={form.statusReason} onChange={setField('statusReason')} />
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            <h3 style={sectionTitleStyle}>Professional Details</h3>
            <div className="admin-info-grid">
              <select style={fieldStyle} value={form.qualificationLevel} onChange={setField('qualificationLevel')} required>
                {qualificationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <input style={fieldStyle} type="number" min="0" placeholder="Experience years" value={form.experienceYears} onChange={setField('experienceYears')} />
              <input style={fieldStyle} placeholder="Specialization" value={form.specialization} onChange={setField('specialization')} />
              <input style={fieldStyle} placeholder="Registration number" value={form.registrationNumber} onChange={setField('registrationNumber')} required />
              <input style={fieldStyle} placeholder="Nursing council / authority" value={form.nursingCouncilName} onChange={setField('nursingCouncilName')} required />
              <select style={fieldStyle} value={form.governmentIdType} onChange={setField('governmentIdType')} required>
                {governmentIdOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div style={{ gridColumn: '1 / -1' }}>
                <input
                  style={fieldStyle}
                  placeholder="Services (comma separated) e.g. Elderly Care, ICU Support, Injection, Wound Dressing"
                  value={form.services}
                  onChange={setField('services')}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            <h3 style={sectionTitleStyle}>Address</h3>
            <div className="admin-info-grid">
              <input style={fieldStyle} placeholder="Address line 1" value={form.line1} onChange={setField('line1')} required />
              <input style={fieldStyle} placeholder="Address line 2" value={form.line2} onChange={setField('line2')} />
              <input style={fieldStyle} placeholder="City" value={form.city} onChange={setField('city')} required />
              <input style={fieldStyle} placeholder="State" value={form.state} onChange={setField('state')} required />
              <input style={fieldStyle} placeholder="Pincode" value={form.pincode} onChange={setField('pincode')} required />
            </div>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            <h3 style={sectionTitleStyle}>Qualification And Verification Documents</h3>
            <div className="admin-info-grid">
              <div>
                <label style={sectionTitleStyle}>ANM Certificate</label>
                <input style={fieldStyle} type="file" accept=".pdf,image/*" onChange={setField('anmCertificate')} />
              </div>
              <div>
                <label style={sectionTitleStyle}>GNM Certificate</label>
                <input style={fieldStyle} type="file" accept=".pdf,image/*" onChange={setField('gnmCertificate')} />
              </div>
              <div>
                <label style={sectionTitleStyle}>BSN Certificate</label>
                <input style={fieldStyle} type="file" accept=".pdf,image/*" onChange={setField('bsnCertificate')} />
              </div>
              <div>
                <label style={sectionTitleStyle}>Registration Certificate</label>
                <input style={fieldStyle} type="file" accept=".pdf,image/*" onChange={setField('registrationCertificate')} />
              </div>
              <div>
                <label style={sectionTitleStyle}>Government ID</label>
                <input style={fieldStyle} type="file" accept=".pdf,image/*" onChange={setField('governmentId')} />
              </div>
              <div>
                <label style={sectionTitleStyle}>Profile Photo</label>
                <input style={fieldStyle} type="file" accept="image/*" onChange={setField('profilePhoto')} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" className="admin-action-button secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="admin-panel-action" disabled={saving}>
              <Save size={16} />
              {saving ? 'Saving...' : isEdit ? 'Save Nurse Changes' : 'Create Nurse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const NursesPage = () => {
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNurse, setSelectedNurse] = useState(null);
  const [formMode, setFormMode] = useState('');
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [statusLoading, setStatusLoading] = useState('');

  const fetchNurses = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await apiRequest('/api/admin/nurses');
      setNurses(pickList(payload));
    } catch (err) {
      setError(err.message || 'Unable to load nurse data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNurses();
  }, []);

  const filteredNurses = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return nurses;
    return nurses.filter((nurse) =>
      [
        nurse.fullName,
        nurse.user?.email,
        nurse.phoneNumber,
        nurse.qualificationLevel,
        nurse.specialization,
        nurse.address?.city,
        nurse.address?.state,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [nurses, searchTerm]);

  const stats = useMemo(
    () => ({
      total: nurses.length,
      active: nurses.filter((item) => item.status === 'active').length,
      pending: nurses.filter((item) => item.status === 'pending').length,
      suspended: nurses.filter((item) => item.status === 'suspended').length,
    }),
    [nurses]
  );

  const openCreate = () => {
    setForm(defaultForm);
    setFormMode('create');
  };

  const openDetails = async (nurseId) => {
    try {
      const payload = await apiRequest(`/api/admin/nurses/${nurseId}`);
      setSelectedNurse(payload.data);
    } catch (err) {
      window.alert(err.message || 'Unable to load nurse details.');
    }
  };

  const openEdit = async (nurseOrId) => {
    const nurseId = typeof nurseOrId === 'string' ? nurseOrId : nurseOrId?._id;
    if (!nurseId) return;
    try {
      const payload = await apiRequest(`/api/admin/nurses/${nurseId}`);
      setForm(mapNurseToForm(payload.data));
      setSelectedNurse(payload.data);
      setFormMode('edit');
    } catch (err) {
      window.alert(err.message || 'Unable to load nurse details.');
    }
  };

  const closeForm = () => {
    setFormMode('');
    setForm(defaultForm);
  };

  const upsertLocalNurse = (nurse) => {
    setNurses((prev) => {
      const exists = prev.some((item) => item._id === nurse._id);
      if (!exists) return [nurse, ...prev];
      return prev.map((item) => (item._id === nurse._id ? nurse : item));
    });
    setSelectedNurse((prev) => (prev && prev._id === nurse._id ? nurse : prev));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('fullName', form.fullName);
      payload.append('email', form.email);
      if (form.password) payload.append('password', form.password);
      payload.append('phoneNumber', form.phoneNumber);
      payload.append('gender', form.gender);
      payload.append('qualificationLevel', form.qualificationLevel);
      payload.append('experienceYears', form.experienceYears || '0');
      payload.append('specialization', form.specialization);
      payload.append('services', form.services);
      payload.append('registrationNumber', form.registrationNumber);
      payload.append('nursingCouncilName', form.nursingCouncilName);
      payload.append('governmentIdType', form.governmentIdType);
      payload.append('line1', form.line1);
      payload.append('line2', form.line2);
      payload.append('city', form.city);
      payload.append('state', form.state);
      payload.append('pincode', form.pincode);
      payload.append('address[line1]', form.line1);
      payload.append('address[line2]', form.line2);
      payload.append('address[city]', form.city);
      payload.append('address[state]', form.state);
      payload.append('address[pincode]', form.pincode);
      payload.append('status', form.status);
      payload.append('statusReason', form.statusReason);

      [
        'anmCertificate',
        'gnmCertificate',
        'bsnCertificate',
        'registrationCertificate',
        'governmentId',
        'profilePhoto',
      ].forEach((field) => {
        if (form[field] instanceof File) {
          payload.append(field, form[field]);
        }
      });

      const path =
        formMode === 'edit' && selectedNurse?._id
          ? `/api/admin/nurses/${selectedNurse._id}`
          : '/api/admin/nurses';
      const method = formMode === 'edit' ? 'PUT' : 'POST';
      const response = await apiRequest(path, { method, body: payload });
      upsertLocalNurse(response.data);
      closeForm();
      if (formMode === 'edit') {
        setSelectedNurse(response.data);
      }
    } catch (err) {
      window.alert(err.message || 'Unable to save nurse.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (nurse, status) => {
    const reason =
      window.prompt(`Add a reason for setting this nurse to ${status} (optional):`, nurse.statusReason || '') ?? '';
    try {
      setStatusLoading(nurse._id);
      const response = await apiRequest(`/api/admin/nurses/${nurse._id}/status`, {
        method: 'PATCH',
        body: { status, reason },
      });
      upsertLocalNurse(response.data);
      setSelectedNurse(response.data);
    } catch (err) {
      window.alert(err.message || 'Unable to update nurse status.');
    } finally {
      setStatusLoading('');
    }
  };

  return (
    <div className="admin-panel-page">
      <div className="admin-panel-hero">
        <div>
          <div className="admin-panel-kicker">
            <BadgePlus size={14} />
            Nurse Management
          </div>
          <h1 className="admin-panel-title">Nurse Onboarding And Control</h1>
          <p className="admin-panel-subtitle">
            Create a dedicated nurse record from admin, upload ANM/GNM/BSN and verification
            documents, and manage whether the nurse is active, pending, or suspended inside the system.
          </p>
        </div>
        <button className="admin-panel-action" onClick={openCreate}>
          <BadgePlus size={16} />
          Add Nurse
        </button>
      </div>

      <div className="admin-panel-stats">
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Total Nurses</p>
          <div className="admin-panel-stat-value">{stats.total}</div>
          <p className="admin-panel-stat-note">Onboarded records</p>
        </div>
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Active</p>
          <div className="admin-panel-stat-value">{stats.active}</div>
          <p className="admin-panel-stat-note">Available in system</p>
        </div>
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Pending</p>
          <div className="admin-panel-stat-value">{stats.pending}</div>
          <p className="admin-panel-stat-note">Waiting for admin finalisation</p>
        </div>
        <div className="admin-panel-stat">
          <p className="admin-panel-stat-label">Suspended</p>
          <div className="admin-panel-stat-value">{stats.suspended}</div>
          <p className="admin-panel-stat-note">Temporarily blocked</p>
        </div>
      </div>

      <div className="admin-panel-card">
        <div className="admin-panel-toolbar">
          <div className="admin-panel-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name, email, phone, qualification, city..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="admin-panel-toolbar-meta">
            <span className="admin-panel-chip">
              <UserRound size={14} />
              {filteredNurses.length} visible nurses
            </span>
          </div>
        </div>

        {loading ? (
          <div className="admin-panel-empty">Loading nurses...</div>
        ) : error ? (
          <div className="admin-panel-empty">{error}</div>
        ) : (
          <table className="admin-panel-table">
            <thead>
              <tr>
                <th>Nurse</th>
                <th>Contact</th>
                <th>Qualification</th>
                <th>Services</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNurses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="admin-panel-empty">
                    No nurse records found.
                  </td>
                </tr>
              ) : (
                filteredNurses.map((nurse) => {
                  const avatar = resolveFileUrl(nurse.documents?.profilePhoto) || nurse.user?.avatarUrl;
                  const statusClass =
                    nurse.status === 'active'
                      ? 'success'
                      : nurse.status === 'suspended'
                        ? 'danger'
                        : 'secondary';
                  return (
                    <tr key={nurse._id}>
                      <td>
                        <div className="admin-panel-entity">
                          <div className="admin-panel-avatar" style={{ overflow: 'hidden' }}>
                            {avatar ? (
                              <img
                                src={avatar}
                                alt={nurse.fullName}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              buildInitials(nurse.fullName)
                            )}
                          </div>
                          <div>
                            <span className="admin-panel-entity-title">{nurse.fullName}</span>
                            <span className="admin-panel-entity-subtitle">
                              {nurse.specialization || 'General nurse'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'grid', gap: 6 }}>
                          <span className="admin-panel-entity-subtitle">
                            <Mail size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                            {nurse.user?.email || '-'}
                          </span>
                          <span className="admin-panel-entity-subtitle">
                            <Phone size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                            {nurse.phoneNumber || '-'}
                          </span>
                          <span className="admin-panel-entity-subtitle">
                            <MapPin size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                            {nurse.address?.city || '-'}, {nurse.address?.state || '-'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'grid', gap: 4 }}>
                          <span style={{ fontWeight: 700 }}>{nurse.qualificationLevel}</span>
                          <span className="admin-panel-entity-subtitle">
                            Reg. {nurse.registrationNumber || '-'}
                          </span>
                        </div>
                      </td>
                      <td>{nurse.services?.length ? nurse.services.join(', ') : 'No services added'}</td>
                      <td>
                        <span className={`admin-action-button ${statusClass}`} style={{ cursor: 'default' }}>
                          {formatStatus(nurse.status)}
                        </span>
                      </td>
                      <td>
                        <div className="admin-panel-actions">
                          <button className="admin-action-button" onClick={() => openDetails(nurse._id)}>
                            <Eye size={16} />
                            View
                          </button>
                          <button className="admin-action-button secondary" onClick={() => openEdit(nurse._id)}>
                            <Save size={16} />
                            Edit
                          </button>
                          {nurse.status !== 'active' && (
                            <button
                              className="admin-action-button success"
                              disabled={statusLoading === nurse._id}
                              onClick={() => handleStatusChange(nurse, 'active')}
                            >
                              <ShieldCheck size={16} />
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectedNurse && !formMode && (
        <NurseDetailsModal
          nurse={selectedNurse}
          onClose={() => setSelectedNurse(null)}
          onEdit={openEdit}
          onStatusChange={handleStatusChange}
          statusLoading={statusLoading === selectedNurse._id}
        />
      )}

      {!!formMode && (
        <NurseFormModal
          mode={formMode}
          form={form}
          setForm={setForm}
          saving={saving}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default NursesPage;
