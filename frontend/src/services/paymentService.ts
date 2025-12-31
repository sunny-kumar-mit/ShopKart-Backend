import { useAuthStore } from '@/store/authStore';

const API_URL = 'http://localhost:5000/api/payment';

const getHeaders = () => {
    const token = useAuthStore.getState().user?.token;
    return {
        'Content-Type': 'application/json',
        'x-auth-token': token || '',
    };
};

export const PaymentService = {
    // 1. Create Order on Razorpay
    createOrder: async (amount: number) => {
        const response = await fetch(`${API_URL}/create-order`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ amount }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to initiate payment');
        return result;
    },

    // 2. Verify Payment & Save Order
    verifyPayment: async (paymentData: any) => {
        const response = await fetch(`${API_URL}/verify`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(paymentData),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Payment verification failed');
        return result;
    },

    // Helper to load Razorpay Script
    loadRazorpayScript: () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    }
};
