import { apiRequest } from '../utils/api';

export const giveServiceService = {
    getAllRequests: async () => {
        return apiRequest('/api/admin/give-service');
    },
};
