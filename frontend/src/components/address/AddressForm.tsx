import { useState, useEffect } from 'react';
import { Address, AddressFormData } from '@/types/address';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AddressService } from '@/services/addressService';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import MapLocationPicker from './MapLocationPicker';
import { MapPin } from 'lucide-react';

interface AddressFormProps {
    initialData?: Address | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export const AddressForm = ({ initialData, onSuccess, onCancel }: AddressFormProps) => {
    const [loading, setLoading] = useState(false);
    const [fetchingPincode, setFetchingPincode] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [formData, setFormData] = useState<AddressFormData>({
        fullName: '',
        phone: '',
        altPhone: '',
        pincode: '',
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        city: '',
        state: '',
        addressType: 'Home',
        isDefault: false
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                fullName: initialData.fullName,
                phone: initialData.phone,
                altPhone: initialData.altPhone || '',
                pincode: initialData.pincode,
                addressLine1: initialData.addressLine1,
                addressLine2: initialData.addressLine2,
                landmark: initialData.landmark || '',
                city: initialData.city,
                state: initialData.state,
                addressType: initialData.addressType,
                isDefault: initialData.isDefault
            });
        }
    }, [initialData]);

    const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, pincode: value }));

        if (value.length === 6) {
            setFetchingPincode(true);
            try {
                const result = await AddressService.fetchPincodeDetails(value);
                if (result) {
                    setFormData(prev => ({ ...prev, city: result.city, state: result.state }));
                    toast.success('City and State fetched successfully!');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setFetchingPincode(false);
            }
        }
    };

    const handleMapConfirm = (data: any) => {
        const addr = data.address;

        setFormData(prev => ({
            ...prev,
            pincode: addr.postcode || prev.pincode,
            city: addr.city || addr.town || addr.village || addr.city_district || addr.county || prev.city,
            state: addr.state || prev.state,
            addressLine1: formData.addressLine1, // Keep user entered house no if any
            addressLine2: data.display_name || '', // Full address -> Locality
            landmark: addr.suburb || addr.neighbourhood || addr.road || ''
        }));

        setIsMapOpen(false);

        // Refine city/state if pincode available
        if (addr.postcode) {
            handlePincodeChange({ target: { value: addr.postcode } } as any);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Basic validation
            if (!/^[0-9]{10}$/.test(formData.phone)) {
                throw new Error('Invalid mobile number');
            }
            if (formData.altPhone && !/^[0-9]{10}$/.test(formData.altPhone)) {
                throw new Error('Invalid alternate mobile number');
            }
            if (!/^[0-9]{6}$/.test(formData.pincode)) {
                throw new Error('Invalid pincode');
            }

            if (initialData) {
                await AddressService.update(initialData._id, formData);
                toast.success('Address updated successfully');
            } else {
                await AddressService.add(formData);
                toast.success('Address added successfully');
            }
            onSuccess();
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-4">
                <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
                    <DialogTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                            <MapPin className="w-4 h-4 mr-2" />
                            Use my current location
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Pin your exact location</DialogTitle>
                        </DialogHeader>
                        <MapLocationPicker onConfirm={handleMapConfirm} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                        required
                        placeholder="John Doe"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Mobile Number</Label>
                    <Input
                        id="phone"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        required
                        placeholder="10-digit number"
                        maxLength={10}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                        id="pincode"
                        value={formData.pincode}
                        onChange={handlePincodeChange}
                        required
                        placeholder="6-digit pincode"
                        maxLength={6}
                    />
                    {fetchingPincode && <span className="text-xs text-muted-foreground">Fetching details...</span>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="addressLine1">House No. / Building</Label>
                    <Input
                        id="addressLine1"
                        value={formData.addressLine1}
                        onChange={e => setFormData({ ...formData, addressLine1: e.target.value })}
                        required
                        placeholder="Flat 101, Galaxy Apts"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="addressLine2">Street / Area / Locality</Label>
                <Input
                    id="addressLine2"
                    value={formData.addressLine2}
                    onChange={e => setFormData({ ...formData, addressLine2: e.target.value })}
                    required
                    placeholder="Sector 15, Gurgaon"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                        id="city"
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        required
                        disabled // Auto-filled usually
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                        id="state"
                        value={formData.state}
                        onChange={e => setFormData({ ...formData, state: e.target.value })}
                        required
                        disabled
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="landmark">Landmark (Optional)</Label>
                    <Input
                        id="landmark"
                        value={formData.landmark}
                        onChange={e => setFormData({ ...formData, landmark: e.target.value })}
                        placeholder="Near Metro Station"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="altPhone">Alt Phone (Optional)</Label>
                    <Input
                        id="altPhone"
                        value={formData.altPhone}
                        onChange={e => setFormData({ ...formData, altPhone: e.target.value })}
                        maxLength={10}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Address Type</Label>
                <RadioGroup
                    value={formData.addressType}
                    onValueChange={(val: 'Home' | 'Work' | 'Other') => setFormData({ ...formData, addressType: val })}
                    className="flex gap-4"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Home" id="home" />
                        <Label htmlFor="home">Home</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Work" id="work" />
                        <Label htmlFor="work">Work</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Other" id="other" />
                        <Label htmlFor="other">Other</Label>
                    </div>
                </RadioGroup>
            </div>

            <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                    id="isDefault"
                    checked={formData.isDefault}
                    onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked as boolean })}
                />
                <Label htmlFor="isDefault">Make this my default address</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : (initialData ? 'Update Address' : 'Save Address')}
                </Button>
            </div>
        </form>
    );
};
