export interface Address {
    _id: string;
    userId: string;
    fullName: string;
    phone: string;
    altPhone?: string;
    pincode: string;
    addressLine1: string;
    addressLine2: string;
    landmark?: string;
    city: string;
    state: string;
    addressType: 'Home' | 'Work' | 'Other';
    isDefault: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export type AddressFormData = Omit<Address, '_id' | 'userId' | 'createdAt' | 'updatedAt'>;
