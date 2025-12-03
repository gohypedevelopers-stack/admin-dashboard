import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Filter, MoreVertical, Trash2, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import './users-page.css';
import { getAdminToken } from '../../utils/api';
import { userService } from '../../services/userService';

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
                      <button
                        className="action-btn delete"
                        title="Delete User"
                        onClick={() => handleDeleteSingle(user.id)}
                        disabled={actionLoading}
                      >
                        <Trash2 size={16} />
                      </button>
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
    </div>
  );
};

export default UsersPage;
