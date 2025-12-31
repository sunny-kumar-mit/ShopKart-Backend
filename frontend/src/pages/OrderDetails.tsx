import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Order } from '@/types/order';
import { OrderService } from '@/services/orderService';
import { OrderTimeline } from '@/components/orders/OrderTimeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Download, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function OrderDetails() {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchOrder = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await OrderService.getOrderById(id);
            setOrder(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const handleCancel = async () => {
        if (!order) return;
        if (!confirm('Are you sure you want to cancel this order?')) return;

        try {
            await OrderService.cancelOrder(order._id);
            toast.success('Order cancelled successfully');
            fetchOrder();
        } catch (error: any) {
            toast.error(error.message || 'Failed to cancel order');
        }
    };

    const handleReturn = async () => {
        if (!order) return;
        if (!confirm('Are you sure you want to return this order?')) return;

        try {
            await OrderService.returnOrder(order._id);
            toast.success('Return request initiated');
            fetchOrder();
        } catch (error: any) {
            toast.error(error.message || 'Failed to return order');
        }
    };

    if (loading) return <Layout>Loading...</Layout>;
    if (!order) return <Layout>Order not found</Layout>;

    const canCancel = ['Processing', 'Shipped'].includes(order.orderStatus);
    const canReturn = order.orderStatus === 'Delivered';

    return (
        <Layout>
            <div className="container mx-auto py-8 bg-gray-50/50 min-h-screen">
                <div className="mb-6">
                    <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-primary">
                        <Link to="/orders">
                            <ChevronLeft className="w-4 h-4 mr-2" /> Back to My Orders
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Status & Timeline */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div>
                                    <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Order ID</div>
                                    <div className="text-lg font-bold">#{order._id.toUpperCase()}</div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                        <Download className="w-4 h-4 mr-2" /> Invoice
                                    </Button>
                                    {canCancel && (
                                        <Button variant="destructive" size="sm" onClick={handleCancel}>
                                            Cancel Order
                                        </Button>
                                    )}
                                    {canReturn && (
                                        <Button variant="secondary" size="sm" onClick={handleReturn}>
                                            Return Item
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <OrderTimeline status={order.orderStatus} dates={order.dates} />
                            </CardContent>
                        </Card>

                        {/* Items */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Items in this order</CardTitle>
                            </CardHeader>
                            <CardContent className="divide-y">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                                        <div className="w-20 h-20 bg-white border rounded-md p-2 shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium">{item.name}</h4>
                                            <div className="text-sm text-muted-foreground mt-1">Quantity: {item.quantity}</div>
                                            <div className="font-semibold mt-2">₹{item.price.toLocaleString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Summary */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Shipping Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="font-medium">{order.shippingAddress.fullName}</div>
                                <div className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                    {order.shippingAddress.addressLine1},<br />
                                    {order.shippingAddress.addressLine2}<br />
                                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                </div>
                                <div className="text-sm font-medium mt-3">Phone: {order.shippingAddress.phone}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Payment Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Item Total</span>
                                    <span>₹{order.totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Delivery</span>
                                    <span className="text-green-600">Free</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Grand Total</span>
                                    <span>₹{order.totalAmount.toLocaleString()}</span>
                                </div>

                                <div className="mt-4 pt-4 border-t">
                                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Payment Method</div>
                                    <div className="text-sm font-medium flex items-center gap-2">
                                        {order.paymentMethod}
                                        <Badge variant={order.paymentStatus === 'Completed' ? 'default' : 'secondary'} className="text-[10px] h-5">
                                            {order.paymentStatus}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
