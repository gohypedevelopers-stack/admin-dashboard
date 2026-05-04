import { apiRequest } from '../utils/api';

export const serviceRequestService = {
  getAllRequests: async () => apiRequest('/api/admin/service-requests'),
  updateStatus: async (requestId, status) =>
    apiRequest(`/api/admin/service-requests/${requestId}/status`, {
      method: 'PATCH',
      body: { status },
    }),
};
