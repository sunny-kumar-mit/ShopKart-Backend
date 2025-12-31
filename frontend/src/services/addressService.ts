import { useAuthStore } from '@/store/authStore';
import { Address, AddressFormData } from '@/types/address';

const API_URL = 'http://localhost:5000/api/addresses';

const getHeaders = () => {
    const token = useAuthStore.getState().user?.token;
    return {
        'Content-Type': 'application/json',
        'x-auth-token': token || '',
    };
};

// ============================
// PINCODE LOOKUP (INDIA)
// ============================
const fetchPincodeDetails = async (pincode: string) => {
    try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await res.json();

        if (data?.[0]?.Status === 'Success') {
            const po = data[0].PostOffice[0];
            return {
                city: po.District,
                state: po.State,
            };
        }
        return null;
    } catch (err) {
        console.error('Pincode lookup failed', err);
        return null;
    }
};

export const AddressService = {
    // ============================
    // ADDRESS CRUD
    // ============================
    getAll: async (): Promise<Address[]> => {
        const response = await fetch(API_URL, { headers: getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch addresses');
        return response.json();
    },

    add: async (data: AddressFormData): Promise<Address> => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to add address');
        return result;
    },

    update: async (id: string, data: AddressFormData): Promise<Address> => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to update address');
        return result;
    },

    delete: async (id: string): Promise<void> => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to delete address');
    },

    setDefault: async (id: string): Promise<Address> => {
        const response = await fetch(`${API_URL}/${id}/default`, {
            method: 'PATCH',
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Failed to set default address');
        return response.json();
    },

    fetchPincodeDetails,



    // ============================
    // HIGH ACCURACY LOCATION
    // ============================
    getCurrentCoordinates: (): Promise<{ lat: number; lon: number }> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject('Geolocation not supported');
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    resolve({
                        lat: pos.coords.latitude,
                        lon: pos.coords.longitude,
                    });
                },
                (err) => reject(err),
                {
                    enableHighAccuracy: true, // 🔥 VERY IMPORTANT
                    timeout: 15000,
                    maximumAge: 0,
                }
            );
        });
    },

    // ============================
    // REVERSE GEOCODE (OSM)
    // ============================
    reverseGeocodeAccurate: async (lat: number, lon: number) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
                {
                    headers: {
                        'Accept-Language': 'en',
                        'User-Agent': 'FlipkartStyleEcommerce/1.0 (contact@example.com)',
                    },
                }
            );

            const data = await response.json();
            if (!data?.address) return null;

            const addr = data.address;

            const result = {
                pincode: addr.postcode || '',
                city:
                    addr.city ||
                    addr.town ||
                    addr.village ||
                    addr.city_district ||
                    addr.county ||
                    '',
                state: addr.state || '',
                area:
                    addr.suburb ||
                    addr.neighbourhood ||
                    addr.residential ||
                    addr.road ||
                    '',
                fullAddress: data.display_name || '',
            };

            // 🔁 FINAL CORRECTION USING PINCODE API
            if (result.pincode) {
                const pinData = await fetchPincodeDetails(result.pincode);
                if (pinData) {
                    result.city = pinData.city;
                    result.state = pinData.state;
                }
            }

            return result;
        } catch (err) {
            console.error('Reverse geocoding failed', err);
            return null;
        }
    },
};
