import { apiRequest } from '../utils/api';

export const appointmentService = {
    getAllAppointments: async () => {
        return apiRequest('/api/admin/appointments');
    },

    updateAppointmentStatus: async (appointmentId, status) => {
        return apiRequest(`/api/admin/appointments/${appointmentId}/status`, {
            method: 'PATCH',
            body: { status },
        });
    },

    deleteAppointment: async (appointmentId) => {
        return apiRequest(`/api/admin/appointments/${appointmentId}`, {
            method: 'DELETE',
        });
    },

    bulkUpdateStatus: async (appointmentIds, status) => {
        return apiRequest('/api/admin/appointments/bulk-update-status', {
            method: 'POST',
            body: { appointmentIds, status },
        });
    },
};
