import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AdminTable from '../../components/Common/AdminTable';
import './users-page.css';
import { apiRequest, getAdminToken } from '../../utils/api';

const COLUMNS = [
  { key: 'id', label: 'ID', type: 'text' },
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'role', label: 'Role', type: 'text' },
  { key: 'status', label: 'Status', type: 'text' },
];

const UsersPage = ({ fixedRole }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const pathParts = location.pathname.split('/').filter(Boolean);
  const pathRole = pathParts[1] ? capitalize(pathParts[1]) : 'All';
  const roleFilter = fixedRole || pathRole || 'All';
  const statusFilter = (params.get('status') || 'All').toLowerCase();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [selectedUser, setSelectedUser] = useState('');
  const [roleSelection, setRoleSelection] = useState('user');
  const [bulkSelection, setBulkSelection] = useState([]);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    const fetchUsers = async () => {
      if (!getAdminToken()) {
        throw new Error('Admin token missing. Please sign in.');
      }

      const params = new URLSearchParams();
      if (roleFilter && roleFilter !== 'All') {
        params.set('role', roleFilter.toLowerCase());
      }
      if (statusFilter && statusFilter !== 'all') {
        params.set('isActive', statusFilter === 'active');
      }

      const payload = await apiRequest(`/api/admin/users?${params.toString()}`);
      const list = Array.isArray(payload?.data?.users) ? payload.data.users : Array.isArray(payload?.users) ? payload.users : [];

      const rows = list.map((user) => ({
        id: user._id || user.id,
        name: user.userName || '-',
        email: user.email || '-',
        role: (user.role || 'user').replace(/^\w/, (c) => c.toUpperCase()),
        status: user.isActive ? 'Active' : 'Suspended',
      }));

      if (!active) return;
      setData(rows);
    };

    fetchUsers()
      .catch((err) => {
        if (!active) return;
        setError(err?.message || 'Failed to load users');
        setData([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [roleFilter, statusFilter, reloadTrigger]);

  const tableData = useMemo(() => data, [data]);

  useEffect(() => {
    if (!selectedUser && tableData.length) {
      setSelectedUser(tableData[0].id);
      setRoleSelection(roleFromRow(tableData[0]));
    }
  }, [tableData, selectedUser]);

  const handleRoleUpdate = async () => {
    if (!selectedUser) {
      setActionError('Select a user first');
      return;
    }
    setActionLoading(true);
    setActionError('');
    try {
      await apiRequest(`/api/admin/users/${selectedUser}/role`, {
        method: 'PUT',
        body: { role: roleSelection },
      });
      setActionMessage('Role updated successfully');
      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      setActionError(err?.message || 'Unable to update role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) {
      setActionError('Select a user first');
      return;
    }
    setActionLoading(true);
    setActionError('');
    try {
      await apiRequest(`/api/admin/users/${selectedUser}`, {
        method: 'DELETE',
      });
      setActionMessage('User deleted successfully');
      setBulkSelection((prev) => prev.filter((id) => id !== selectedUser));
      setSelectedUser('');
      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      setActionError(err?.message || 'Unable to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!bulkSelection.length) {
      setActionError('Select at least one user for bulk delete');
      return;
    }
    setActionLoading(true);
    setActionError('');
    try {
      await apiRequest('/api/admin/users/bulk-delete', {
        method: 'POST',
        body: { userIds: bulkSelection },
      });
      setActionMessage('Users deleted successfully');
      setBulkSelection([]);
      if (bulkSelection.includes(selectedUser)) {
        setSelectedUser('');
      }
      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      setActionError(err?.message || 'Unable to delete users');
    } finally {
      setActionLoading(false);
    }
  };

  const userOptions = useMemo(
    () => tableData.map((row) => ({ id: row.id, label: `${row.name} (${row.email})` })),
    [tableData]
  );

  const handleBulkSelectionChange = (event) => {
    const selected = Array.from(event.target.selectedOptions, (opt) => opt.value);
    setBulkSelection(selected);
  };

  return (
    <div className="users-page">
      {error && <div className="users-error">{error}</div>}
      {loading ? (
        <div className="users-loading">Loading users...</div>
      ) : (
        <>
          <AdminTable
            title="Users Management"
            columns={COLUMNS}
            initialData={tableData}
          />
          <div className="user-actions">
            <h3>Admin actions</h3>
            {actionMessage && <div className="action-message success">{actionMessage}</div>}
            {actionError && <div className="action-message error">{actionError}</div>}
            <div className="action-row">
              <label htmlFor="user-select">Select user</label>
              <select
                id="user-select"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Select user</option>
                {userOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <label htmlFor="role-select">Set role</label>
              <select
                id="role-select"
                value={roleSelection}
                onChange={(e) => setRoleSelection(e.target.value)}
              >
                {["user", "doctor", "admin", "pharmacy"].map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
              <button type="button" onClick={handleRoleUpdate} disabled={actionLoading || !selectedUser}>
                Update Role
              </button>
            </div>
            <div className="action-row">
              <button type="button" onClick={handleDeleteUser} disabled={actionLoading || !selectedUser}>
                Delete User
              </button>
            </div>
            <div className="action-row">
              <label htmlFor="bulk-select">Bulk delete (hold Ctrl / Cmd to select multiple)</label>
              <select
                id="bulk-select"
                multiple
                size={4}
                value={bulkSelection}
                onChange={handleBulkSelectionChange}
              >
                {userOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={actionLoading || !bulkSelection.length}
              >
                Delete Selected
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const roleFromRow = (row) => {
  if (!row?.role) return 'user';
  return row.role.toLowerCase();
};

export default UsersPage;
