import { useAuthStore } from '@/store/authStore';
import { Order } from '@/types/order';

const API_URL = 'http://localhost:5000/api/orders';

const getHeaders = () => {
    const token = useAuthStore.getState().user?.token;
    return {
        'Content-Type': 'application/json',
        'x-auth-token': token || '',
    };
};

export const OrderService = {
    getMyOrders: async (): Promise<Order[]> => {
        const response = await fetch(API_URL, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch orders');
        return response.json();
    },

    getOrderById: async (id: string): Promise<Order> => {
        const response = await fetch(`${API_URL}/${id}`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch order details');
        return response.json();
    },

    cancelOrder: async (id: string): Promise<Order> => {
        const response = await fetch(`${API_URL}/${id}/cancel`, {
            method: 'PATCH',
            headers: getHeaders(),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to cancel order');
        return result;
    },

    returnOrder: async (id: string): Promise<Order> => {
        const response = await fetch(`${API_URL}/${id}/return`, {
            method: 'PATCH',
            headers: getHeaders(),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to return order');
        return result;
    },

    // Mock order creation for testing
    createMockOrder: async (orderData: any): Promise<Order> => {
        const response = await fetch(`${API_URL}/mock`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(orderData),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to create mock order');
        return result;
    }
};
