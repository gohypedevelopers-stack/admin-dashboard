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

    deleteOrder: async (orderId) => {
        return apiRequest(`/api/admin/pharmacy/orders/${orderId}`, {
            method: 'DELETE',
        });
    },
    createProduct: async (formData) => {
        // Note: formData should be an instance of FormData for file uploads
        return apiRequest('/api/pharmacy/products', {
            method: 'POST',
            body: formData,
            // apiRequest handles Content-Type automatically for FormData? 
            // Usually fetch needs no Content-Type header for FormData to let browser set boundary
            // We might need to adjust apiRequest if it forces JSON
        });
    },

    updateProduct: async (productId, formData) => {
        return apiRequest(`/api/pharmacy/products/${productId}`, {
            method: 'PUT',
            body: formData,
        });
    },

    deleteProduct: async (productId) => {
        return apiRequest(`/api/pharmacy/products/${productId}`, {
            method: 'DELETE',
        });
    },
};
