import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Order } from '@/types/order';
import { OrderService } from '@/services/orderService';
import { OrderCard } from '@/components/orders/OrderCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { products } from '@/data/mockData'; // For seeding
import { useAuthStore } from '@/store/authStore';

export default function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const user = useAuthStore(state => state.user);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await OrderService.getMyOrders();
            setOrders(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(order =>
        order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // --- TEMPORARY SEED FUNCTION FOR DEMO ---
    const handleSeedOrder = async () => {
        if (loading) return;
        try {
            toast.info('Creating a sample order...');
            const randomProduct = products[Math.floor(Math.random() * products.length)];

            const mockOrder = {
                items: [{
                    productId: randomProduct.id,
                    name: randomProduct.name,
                    image: randomProduct.image,
                    price: randomProduct.price,
                    quantity: 1
                }],
                totalAmount: randomProduct.price,
                shippingAddress: { // Hardcoded for demo, normally from user selection
                    fullName: user?.name || 'User',
                    phone: '9876543210',
                    addressLine1: 'Test Address Line 1',
                    addressLine2: 'Locality',
                    city: 'New Delhi',
                    state: 'Delhi',
                    pincode: '110001',
                    addressType: 'Home'
                }
            };

            await OrderService.createMockOrder(mockOrder);
            toast.success('Sample order created!');
            fetchOrders();
        } catch (error) {
            toast.error('Failed to create sample order');
        }
    };

    return (
        <Layout>
            <div className="container mx-auto py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <h1 className="text-2xl font-bold">My Orders</h1>

                    {/* Search & Filter */}
                    <div className="flex w-full md:w-auto gap-2">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search your orders..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon">
                            <Filter className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-40 rounded-lg bg-muted/20 animate-pulse" />
                        ))}
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-lg bg-muted/5">
                        <div className="bg-primary/10 p-4 rounded-full mb-4">
                            <ShoppingBag className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
                        <p className="text-muted-foreground mb-6 text-center max-w-sm">
                            Looks like you haven't placed any orders yet. Go ahead and explore our products.
                        </p>
                        <div className="flex gap-4">
                            <Button onClick={handleSeedOrder} variant="secondary">
                                Generate Demo Order
                            </Button>
                            <Button asChild>
                                <a href="/">Start Shopping</a>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Demo Button even if list not empty */}
                        <div className="flex justify-end mb-2">
                            <Button onClick={handleSeedOrder} variant="ghost" size="sm" className="text-xs">
                                + Add another demo order
                            </Button>
                        </div>

                        {filteredOrders.map(order => (
                            <OrderCard key={order._id} order={order} />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
