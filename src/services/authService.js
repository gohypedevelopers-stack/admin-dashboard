import { apiRequest } from '../utils/api';

export const authService = {
    login: async (credentials) => {
        return apiRequest('/api/auth/sign-in', {
            method: 'POST',
            body: credentials,
        });
    },

    logout: async () => {
        return apiRequest('/api/auth/sign-out', {
            method: 'POST',
        });
    },

    getProfile: async () => {
        return apiRequest('/api/profile/me');
    },
};
