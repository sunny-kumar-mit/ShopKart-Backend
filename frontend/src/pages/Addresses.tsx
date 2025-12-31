import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Address } from '@/types/address';
import { AddressService } from '@/services/addressService';
import { AddressCard } from '@/components/address/AddressCard';
import { AddressForm } from '@/components/address/AddressForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function Addresses() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    const fetchAddresses = async () => {
        try {
            const data = await AddressService.getAll();
            setAddresses(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load addresses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleEdit = (address: Address) => {
        setEditingAddress(address);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return;
        try {
            await AddressService.delete(id);
            toast.success('Address deleted');
            fetchAddresses();
        } catch (error) {
            toast.error('Failed to delete address');
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            await AddressService.setDefault(id);
            toast.success('Default address updated');
            fetchAddresses();
        } catch (error) {
            toast.error('Failed to update default address');
        }
    };

    const handleFormSuccess = () => {
        setIsDialogOpen(false);
        setEditingAddress(null);
        fetchAddresses();
    };

    return (
        <Layout>
            <div className="container mx-auto py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">My Addresses</h1>
                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) setEditingAddress(null);
                    }}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setEditingAddress(null)}>
                                <Plus className="mr-2 h-4 w-4" /> Add New Address
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                                <DialogDescription>
                                    {editingAddress ? 'Update your address details below.' : 'Enter your new address details below.'}
                                </DialogDescription>
                            </DialogHeader>
                            <AddressForm
                                initialData={editingAddress}
                                onSuccess={handleFormSuccess}
                                onCancel={() => setIsDialogOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>

                {loading ? (
                    <div>Loading...</div>
                ) : addresses.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground mb-4">No addresses saved yet.</p>
                        <Button onClick={() => setIsDialogOpen(true)} variant="outline">
                            Add your first address
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {addresses.map((address) => (
                            <AddressCard
                                key={address._id}
                                address={address}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onSetDefault={handleSetDefault}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
