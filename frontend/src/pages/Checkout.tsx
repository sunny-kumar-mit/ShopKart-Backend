import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { AddressService } from '@/services/addressService';
import { PaymentService } from '@/services/paymentService';
import { Address } from '@/types/address';
import { AddressCard } from '@/components/address/AddressCard'; // Using the existing component
import { AddressForm } from '@/components/address/AddressForm'; // Using the existing component
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { CheckCircle2, MapPin, CreditCard, ShoppingBag, Plus } from 'lucide-react';

const steps = [
    { id: 1, label: 'Address', icon: MapPin },
    { id: 2, label: 'Order Summary', icon: ShoppingBag },
    { id: 3, label: 'Payment', icon: CreditCard },
];

export default function Checkout() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { items, clearCart } = useCartStore();

    // State
    const [currentStep, setCurrentStep] = useState(1);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Derived
    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const discount = subtotal > 1000 ? 50 : 0; // Simple discount logic
    const total = subtotal - discount;

    // Fetch Addresses
    const fetchAddresses = async () => {
        try {
            const data = await AddressService.getAll();
            setAddresses(data);
            const defaultAddr = data.find(a => a.isDefault);
            if (defaultAddr && !selectedAddressId) {
                setSelectedAddressId(defaultAddr._id);
            } else if (data.length > 0 && !selectedAddressId) {
                setSelectedAddressId(data[0]._id);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    // Handlers
    const handleNext = () => {
        if (currentStep === 1 && !selectedAddressId) {
            toast.error('Please select a delivery address');
            return;
        }
        setCurrentStep(prev => prev + 1);
    };

    const handlePayment = async () => {
        setLoading(true);
        try {
            // 1. Load Script
            const isLoaded = await PaymentService.loadRazorpayScript();
            if (!isLoaded) {
                toast.error('Razorpay SDK failed to load');
                setLoading(false);
                return;
            }

            // 2. Create Order
            const order = await PaymentService.createOrder(total);

            // 3. Open Razorpay
            const options = {
                key: 'rzp_test_RxiBYEVHuzI219', // Public Key
                amount: order.amount,
                currency: order.currency,
                name: 'ShopKart',
                description: 'Order Payment',
                image: 'https://cdn-icons-png.flaticon.com/512/3144/3144456.png', // Logo
                order_id: order.id,
                handler: async function (response: any) {
                    try {
                        // 4. Verify Payment on Backend
                        const selectedAddress = addresses.find(a => a._id === selectedAddressId);

                        const verificationData = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderData: {
                                userId: user?.id,
                                items: items.map(i => ({
                                    productId: i.product.id,
                                    name: i.product.name,
                                    image: i.product.image,
                                    price: i.product.price,
                                    quantity: i.quantity
                                })),
                                shippingAddress: selectedAddress,
                                totalAmount: total
                            }
                        };

                        const verifyRes = await PaymentService.verifyPayment(verificationData);

                        if (verifyRes.msg === 'success') {
                            clearCart();
                            navigate('/payment/success');
                        } else {
                            navigate('/payment/failed');
                        }
                    } catch (err) {
                        console.error(err);
                        navigate('/payment/failed');
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: '', // Can fill if user phone exists
                },
                theme: {
                    color: '#2563EB',
                },
            };

            const rzp1 = new (window as any).Razorpay(options);
            rzp1.open();

            rzp1.on('payment.failed', function (response: any) {
                toast.error(response.error.description);
                navigate('/payment/failed');
            });

        } catch (error) {
            console.error(error);
            toast.error('Payment initiation failed');
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <Layout>
                <div className="container mx-auto py-16 text-center">
                    <h2 className="text-xl font-bold mb-4">Your cart is empty</h2>
                    <Button onClick={() => navigate('/')}>Start Shopping</Button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto py-8">
                {/* Stepper */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-2 md:gap-8">
                        {steps.map((step, idx) => (
                            <div key={step.id} className="flex items-center">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 
                                    ${currentStep >= step.id ? 'bg-primary border-primary text-white' : 'border-gray-300 text-gray-400'}`}>
                                    {currentStep > step.id ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                                </div>
                                <span className={`ml-2 text-sm font-medium ${currentStep >= step.id ? 'text-primary' : 'text-gray-400'}`}>
                                    {step.label}
                                </span>
                                {idx < steps.length - 1 && (
                                    <div className="w-8 md:w-20 h-0.5 mx-2 bg-gray-200" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* STEP 1: Address Selection */}
                        {currentStep === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold">Select Delivery Address</h2>
                                    <Button size="sm" variant="outline" onClick={() => setIsAddressModalOpen(true)}>
                                        <Plus className="w-4 h-4 mr-2" /> Add New Address
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {addresses.map(addr => (
                                        <div
                                            key={addr._id}
                                            className={`relative cursor-pointer transition-all ${selectedAddressId === addr._id ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-gray-50'
                                                }`}
                                            onClick={() => setSelectedAddressId(addr._id)}
                                        >
                                            <div className="absolute top-2 right-2">
                                                <input
                                                    type="radio"
                                                    checked={selectedAddressId === addr._id}
                                                    onChange={() => setSelectedAddressId(addr._id)}
                                                    className="w-4 h-4 accent-primary"
                                                />
                                            </div>
                                            {/* Reuse AddressCard but intercept clicks via parent div */}
                                            <div className="pointer-events-none">
                                                <AddressCard address={addr} onEdit={() => { }} onDelete={() => { }} onSetDefault={() => { }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {addresses.length === 0 && (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                                        <p className="text-muted-foreground mb-4">No addresses saved yet.</p>
                                        <Button onClick={() => setIsAddressModalOpen(true)}>Add Address</Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 2: Order Summary */}
                        {currentStep === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-xl font-bold">Review Order</h2>
                                <Card>
                                    <CardContent className="divide-y p-0">
                                        {items.map(item => (
                                            <div key={item.product.id} className="flex gap-4 p-4">
                                                <div className="w-20 h-20 bg-muted/20 p-2 rounded border shrink-0">
                                                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-medium">{item.product.name}</h3>
                                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                                    <p className="font-semibold mt-1">₹{item.product.price.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* STEP 3: Payment */}
                        {currentStep === 3 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-xl font-bold">Payment Method</h2>
                                <Card className="border-primary bg-primary/5">
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                                <span className="font-bold text-blue-700">UPI</span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">Pay Online</h3>
                                                <p className="text-sm text-gray-600">Cards, UPI, Net Banking via Razorpay</p>
                                            </div>
                                        </div>
                                        <div className="h-6 w-6 rounded-full border-4 border-primary bg-white"></div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Price Details */}
                    <div className="h-fit space-y-6">
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <h3 className="font-bold text-lg text-gray-600 uppercase tracking-wide">Price Details</h3>
                                <Separator />
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Price ({items.length} items)</span>
                                        <span>₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Discount</span>
                                        <span className="text-green-600">- ₹{discount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Delivery Charges</span>
                                        <span className="text-green-600">Free</span>
                                    </div>
                                </div>
                                <Separator className="border-dashed" />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total Amount</span>
                                    <span>₹{total.toLocaleString()}</span>
                                </div>

                                <div className="pt-4">
                                    {currentStep < 3 ? (
                                        <Button className="w-full text-lg h-12" onClick={handleNext}>
                                            {currentStep === 1 ? 'Deliver Here' : 'Continue'}
                                        </Button>
                                    ) : (
                                        <Button className="w-full text-lg h-12 bg-orange-500 hover:bg-orange-600" onClick={handlePayment} disabled={loading}>
                                            {loading ? 'Processing...' : `Pay ₹${total.toLocaleString()}`}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        <p className="text-xs text-center text-muted-foreground">
                            Safe and Secure Payments. Easy returns.
                        </p>
                    </div>
                </div>
            </div>

            {/* Address Add Modal */}
            <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add New Address</DialogTitle>
                    </DialogHeader>
                    <AddressForm
                        onSuccess={() => {
                            setIsAddressModalOpen(false);
                            fetchAddresses();
                        }}
                        onCancel={() => setIsAddressModalOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </Layout>
    );
}
