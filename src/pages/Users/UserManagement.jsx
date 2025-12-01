import React, { useState, useEffect } from 'react';
import { MoreVertical, UserCheck, Ban, LogIn } from 'lucide-react';

// Mock Data - Replace with API fetch
const MOCK_USERS = [
  { id: 1, name: 'Dr. Sarah Smith', role: 'Doctor', email: 'sarah@clinic.com', status: 'Active', joinDate: '2023-10-01' },
  { id: 2, name: 'John Doe', role: 'Patient', email: 'john@gmail.com', status: 'Active', joinDate: '2023-11-15' },
  { id: 3, name: 'MediCare Pharmacy', role: 'Pharmacy', email: 'contact@medicare.com', status: 'Suspended', joinDate: '2023-09-20' },
];

const UserManagement = () => {
  const [users, setUsers] = useState(MOCK_USERS);
  const [filter, setFilter] = useState('All');

  // Filter logic
  const filteredUsers = filter === 'All' 
    ? users 
    : users.filter(u => u.role === filter);

  const handleStatusToggle = (id) => {
    // Add API Call here
    setUsers(users.map(u => u.id === id ? {...u, status: u.status === 'Active' ? 'Suspended' : 'Active'} : u));
  };

  return (
    <>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500">Manage access, suspend accounts, and support users.</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          {['All', 'Doctor', 'Patient', 'Pharmacy'].map((role) => (
            <button
              key={role}
              onClick={() => setFilter(role)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all
                ${filter === role ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Name / Email</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Role</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{user.name}</div>
                  <div className="text-sm text-slate-500">{user.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${user.role === 'Doctor' ? 'bg-purple-100 text-purple-800' : 
                      user.role === 'Pharmacy' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${user.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button title="Impersonate" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition-colors">
                      <LogIn size={18} />
                    </button>
                    <button 
                      onClick={() => handleStatusToggle(user.id)}
                      title={user.status === 'Active' ? 'Suspend' : 'Unsuspend'}
                      className={`p-2 rounded-lg transition-colors ${user.status === 'Active' ? 'text-red-500 hover:bg-red-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                    >
                      {user.status === 'Active' ? <Ban size={18} /> : <UserCheck size={18} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default UserManagement;