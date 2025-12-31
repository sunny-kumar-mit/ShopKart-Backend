export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned';
export type PaymentStatus = 'Pending' | 'Completed' | 'Failed' | 'Refunded';

export interface OrderItem {
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
}

export interface OrderDates {
    placed: string;
    shipped?: string;
    delivered?: string;
    cancelled?: string;
    returned?: string;
}

export interface ShippingAddressSnap {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
    addressType: string;
}

export interface Order {
    _id: string;
    userId: string;
    items: OrderItem[];
    shippingAddress: ShippingAddressSnap;
    totalAmount: number;
    paymentMethod: string;
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
    dates: OrderDates;
    createdAt: string;
}
