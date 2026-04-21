import { apiRequest } from '../utils/api';

export const giveServiceService = {
    getAllRequests: async () => {
        return apiRequest('/api/admin/give-service');
    },
    updateStatus: async (requestId, status) => {
        return apiRequest(`/api/admin/give-service/${requestId}/status`, {
            method: 'PATCH',
            body: { status },
        });
    },
};
