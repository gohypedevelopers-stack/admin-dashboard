import { apiRequest } from '../utils/api';

export const doctorService = {
    getAllDoctors: async () => {
        return apiRequest('/api/admin/doctors');
    },

    getDoctorById: async (doctorId) => {
        return apiRequest(`/api/admin/doctors/${doctorId}`);
    },

    toggleDoctorStatus: async (doctorId) => {
        return apiRequest(`/api/admin/doctors/${doctorId}/toggle-status`, {
            method: 'PATCH',
        });
    },

    updateDoctor: async (doctorId, data) => {
        return apiRequest(`/api/admin/doctors/${doctorId}`, {
            method: 'PUT',
            body: data,
        });
    },

    getAllVerifications: async () => {
        return apiRequest('/api/admin/verifications');
    },

    updateVerificationStatus: async (verificationId, status, rejectionReason = '') => {
        return apiRequest(`/api/admin/verifications/${verificationId}/status`, {
            method: 'PATCH',
            body: { status, rejectionReason },
        });
    },
};
