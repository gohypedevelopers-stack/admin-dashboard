import { apiRequest } from '../utils/api';

export const pharmacyService = {
    getAllProducts: async () => {
        return apiRequest('/api/admin/pharmacy/products');
    },

    getAllOrders: async () => {
        return apiRequest('/api/admin/pharmacy/orders');
    },

    updateOrderStatus: async (orderId, status) => {
        return apiRequest(`/api/admin/pharmacy/orders/${orderId}/status`, {
            method: 'PATCH',
            body: { status },
        });
    },
};
