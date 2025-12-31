import { useAuthStore } from '@/store/authStore';

const API_URL = 'http://localhost:5000/api/user';

const getHeaders = () => {
    const token = useAuthStore.getState().user?.token;
    return {
        'Content-Type': 'application/json',
        'x-auth-token': token || ''
    };
};

export const UserService = {
    getProfile: async () => {
        const response = await fetch(`${API_URL}/profile`, {
            method: 'GET',
            headers: getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch profile');
        return data;
    },

    updateProfile: async (data: any) => {
        const response = await fetch(`${API_URL}/profile`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to update profile');
        return result;
    },

    initiateChangePassword: async (currentPassword: string) => {
        const response = await fetch(`${API_URL}/change-password/init`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ currentPassword })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to initiate password change');
        return result;
    },

    verifyChangePasswordOTP: async (data: any) => {
        const response = await fetch(`${API_URL}/change-password/verify`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to verify OTP');
        return result;
    },

    deleteAccount: async () => {
        const response = await fetch(`${API_URL}/delete-account`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to delete account');
        return result;
    }
};
