import { apiRequest } from '../utils/api';

export const userService = {
    getAllUsers: async () => {
        return apiRequest('/api/admin/users');
    },

    getUserById: async (userId) => {
        return apiRequest(`/api/admin/users/${userId}`);
    },

    updateUserRole: async (userId, role) => {
        return apiRequest(`/api/admin/users/${userId}/role`, {
            method: 'PUT',
            body: { role },
        });
    },

    deleteUser: async (userId) => {
        return apiRequest(`/api/admin/users/${userId}`, {
            method: 'DELETE',
        });
    },

    bulkDeleteUsers: async (userIds) => {
        return apiRequest('/api/admin/users/bulk-delete', {
            method: 'POST',
            body: { userIds },
        });
    },
};
