import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, MoreVertical, Trash2, Shield, UserCheck, Eye, BadgeCheck, X } from 'lucide-react';
import './users-page.css';
import { getAdminToken } from '../../utils/api';
import { userService } from '../../services/userService';

const ROLE_OPTIONS = [
  { value: 'user', label: 'Patient / User' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'admin', label: 'Admin' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'nurse', label: 'Nurse' },
];

const UsersPage = ({ fixedRole }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const pathParts = location.pathname.split('/').filter(Boolean);
  let pathRole = pathParts[1] ? pathParts[1].toLowerCase() : 'all';

  if (pathRole === 'patient') pathRole = 'user';

  const roleFilter = fixedRole ? fixedRole.toLowerCase() : pathRole;
  const initialStatusFilter = (params.get('status') || 'all').toLowerCase();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Action States
  const [actionLoading, setActionLoading] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState('');
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [roleValue, setRoleValue] = useState('user');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    const fetchUsers = async () => {
      if (!getAdminToken()) {
        throw new Error('Admin token missing. Please sign in.');
      }

      try {
        const payload = await userService.getAllUsers();
        let list = Array.isArray(payload?.data) ? payload.data : [];

        // Filter by Role
        if (roleFilter && roleFilter !== 'all') {
          list = list.filter(u => (u.role || 'user').toLowerCase() === roleFilter);
        }

        const rows = list.map((user) => ({
          id: user._id || user.id,
          name: user.userName || 'Unknown User',
          email: user.email || '-',
          role: (user.role || 'user').toLowerCase(),
          status: user.isActive !== false ? 'Active' : 'Suspended',
          isActive: user.isActive !== false,
          avatar: user.avatarUrl,
          joined: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-',
        }));

        if (active) setData(rows);
      } catch (err) {
        if (active) setError(err?.message || 'Failed to load users');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchUsers();
    return () => { active = false; };
  }, [roleFilter, reloadTrigger]);

  // Filtering & Pagination
  const filteredData = useMemo(() => {
    return data.filter(user => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all'
        ? true
        : user.status.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(paginatedData.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (id) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!selectedUsers.length || !window.confirm(`Delete ${selectedUsers.length} users?`)) return;

    setActionLoading(true);
    try {
      await userService.bulkDeleteUsers(selectedUsers);
      setReloadTrigger(prev => prev + 1);
      setSelectedUsers([]);
    } catch (err) {
      alert('Failed to delete users');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSingle = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setActionLoading(true);
    try {
      await userService.deleteUser(id);
      setReloadTrigger(prev => prev + 1);
    } catch (err) {
      alert('Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleUserStatus = async (user) => {
    const nextIsActive = !user.isActive;
    const actionLabel = nextIsActive ? 'activate' : 'suspend';

    if (!window.confirm(`Are you sure you want to ${actionLabel} this user?`)) return;

    setActionLoading(true);
    setOpenActionMenu('');
    try {
      await userService.updateUserStatus(user.id, nextIsActive);
      setReloadTrigger(prev => prev + 1);
    } catch (err) {
      alert(err?.message || `Failed to ${actionLabel} user`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewUser = async (userId) => {
    setOpenActionMenu('');
    setDetailsLoading(true);
    try {
      const payload = await userService.getUserById(userId);
      setSelectedUserDetails(payload?.data || null);
    } catch (err) {
      alert(err?.message || 'Failed to load user details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleOpenRoleModal = (user) => {
    setOpenActionMenu('');
    setRoleModalUser(user);
    setRoleValue(user.role || 'user');
  };

  const handleUpdateRole = async () => {
    if (!roleModalUser) return;
    setActionLoading(true);
    try {
      await userService.updateUserRole(roleModalUser.id, roleValue);
      setRoleModalUser(null);
      setReloadTrigger(prev => prev + 1);
    } catch (err) {
      alert(err?.message || 'Failed to update user role');
    } finally {
      setActionLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <h1 className="page-title">
          {roleFilter === 'all' ? 'All Users' : `${roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}s`}
        </h1>
        <p className="page-subtitle">Manage your platform users, roles, and account statuses.</p>
      </div>

      <div className="controls-bar">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {selectedUsers.length > 0 && (
        <div className="bulk-actions">
          <span>{selectedUsers.length} users selected</span>
          <button className="bulk-btn" onClick={handleBulkDelete} disabled={actionLoading}>
            <Trash2 size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Delete Selected
          </button>
        </div>
      )}

      <div className="table-container">
        {loading ? (
          <div className="loading-state">Loading users...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={paginatedData.length > 0 && selectedUsers.length === paginatedData.length}
                  />
                </th>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">No users found matching your criteria.</td>
                </tr>
              ) : (
                paginatedData.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                      />
                    </td>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                          ) : (
                            getInitials(user.name)
                          )}
                        </div>
                        <div className="user-info">
                          <span className="user-name">{user.name}</span>
                          <span className="user-email">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
                    </td>
                    <td>
                      <span className={`status-badge status-${user.status.toLowerCase()}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>{user.joined}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                          className="action-btn"
                          title="User Actions"
                          onClick={() =>
                            setOpenActionMenu((current) => (current === user.id ? '' : user.id))
                          }
                          disabled={actionLoading}
                        >
                          <MoreVertical size={16} />
                        </button>

                        {openActionMenu === user.id && (
                          <div
                            style={{
                              position: 'absolute',
                              right: 0,
                              top: 'calc(100% + 8px)',
                              minWidth: 170,
                              background: '#fff',
                              border: '1px solid #e2e8f0',
                              borderRadius: 12,
                              boxShadow: '0 16px 40px rgba(15, 23, 42, 0.12)',
                              padding: 8,
                              zIndex: 10,
                              display: 'grid',
                              gap: 6,
                            }}
                          >
                            <button
                              type="button"
                              className="action-btn"
                              style={{
                                width: '100%',
                                justifyContent: 'flex-start',
                                gap: 8,
                                padding: '10px 12px',
                              }}
                              onClick={() => handleViewUser(user.id)}
                              disabled={actionLoading || detailsLoading}
                            >
                              <Eye size={16} />
                              View Details
                            </button>
                            <button
                              type="button"
                              className="action-btn"
                              style={{
                                width: '100%',
                                justifyContent: 'flex-start',
                                gap: 8,
                                padding: '10px 12px',
                              }}
                              onClick={() => handleOpenRoleModal(user)}
                              disabled={actionLoading}
                            >
                              <BadgeCheck size={16} />
                              Change Role
                            </button>
                            <button
                              type="button"
                              className="action-btn"
                              style={{
                                width: '100%',
                                justifyContent: 'flex-start',
                                gap: 8,
                                padding: '10px 12px',
                              }}
                              onClick={() => handleToggleUserStatus(user)}
                              disabled={actionLoading}
                            >
                              {user.isActive ? <Shield size={16} /> : <UserCheck size={16} />}
                              {user.isActive ? 'Suspend User' : 'Activate User'}
                            </button>
                            <button
                              type="button"
                              className="action-btn delete"
                              style={{
                                width: '100%',
                                justifyContent: 'flex-start',
                                gap: 8,
                                padding: '10px 12px',
                              }}
                              onClick={() => handleDeleteSingle(user.id)}
                              disabled={actionLoading}
                            >
                              <Trash2 size={16} />
                              Delete User
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {!loading && !error && filteredData.length > 0 && (
          <div className="pagination">
            <span className="pagination-text">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} users
            </span>
            <div className="pagination-controls">
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                Previous
              </button>
              <button
                className="page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedUserDetails && (
        <div className="modal-overlay" onClick={() => setSelectedUserDetails(null)}>
          <div className="modal-content" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">User Details</h2>
                <p className="modal-subtitle">Complete information for the selected user</p>
              </div>
              <button className="close-btn" onClick={() => setSelectedUserDetails(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'grid', gap: 16 }}>
              <div className="user-cell">
                <div className="user-avatar" style={{ width: 56, height: 56 }}>
                  {selectedUserDetails.avatarUrl ? (
                    <img
                      src={selectedUserDetails.avatarUrl}
                      alt={selectedUserDetails.userName || 'User'}
                      style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                    />
                  ) : (
                    getInitials(selectedUserDetails.userName || 'User')
                  )}
                </div>
                <div className="user-info">
                  <span className="user-name">{selectedUserDetails.userName || 'Unknown User'}</span>
                  <span className="user-email">{selectedUserDetails.email || '-'}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                <div className="table-container" style={{ padding: 14 }}>
                  <strong>Role</strong>
                  <div style={{ marginTop: 6, textTransform: 'capitalize' }}>{selectedUserDetails.role || '-'}</div>
                </div>
                <div className="table-container" style={{ padding: 14 }}>
                  <strong>Status</strong>
                  <div style={{ marginTop: 6 }}>
                    <span className={`status-badge status-${selectedUserDetails.isActive === false ? 'suspended' : 'active'}`}>
                      {selectedUserDetails.isActive === false ? 'Suspended' : 'Active'}
                    </span>
                  </div>
                </div>
                <div className="table-container" style={{ padding: 14 }}>
                  <strong>Phone</strong>
                  <div style={{ marginTop: 6 }}>{selectedUserDetails.phoneNumber || '-'}</div>
                </div>
                <div className="table-container" style={{ padding: 14 }}>
                  <strong>Gender</strong>
                  <div style={{ marginTop: 6 }}>{selectedUserDetails.gender || '-'}</div>
                </div>
                <div className="table-container" style={{ padding: 14 }}>
                  <strong>Date of Birth</strong>
                  <div style={{ marginTop: 6 }}>
                    {selectedUserDetails.dateOfBirth ? new Date(selectedUserDetails.dateOfBirth).toLocaleDateString() : '-'}
                  </div>
                </div>
                <div className="table-container" style={{ padding: 14 }}>
                  <strong>Joined</strong>
                  <div style={{ marginTop: 6 }}>
                    {selectedUserDetails.createdAt ? new Date(selectedUserDetails.createdAt).toLocaleString() : '-'}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-close" onClick={() => setSelectedUserDetails(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {roleModalUser && (
        <div className="modal-overlay" onClick={() => setRoleModalUser(null)}>
          <div className="modal-content" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Change User Role</h2>
                <p className="modal-subtitle">{roleModalUser.name}</p>
              </div>
              <button className="close-btn" onClick={() => setRoleModalUser(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'grid', gap: 12 }}>
              <label style={{ display: 'grid', gap: 8 }}>
                <span style={{ fontWeight: 600 }}>Select new role</span>
                <select
                  className="filter-select"
                  value={roleValue}
                  onChange={(e) => setRoleValue(e.target.value)}
                >
                  {ROLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setRoleModalUser(null)} disabled={actionLoading}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleUpdateRole} disabled={actionLoading}>
                {actionLoading ? 'Saving...' : 'Update Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
