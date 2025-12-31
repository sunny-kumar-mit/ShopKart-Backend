import { Order } from '@/types/order';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Truck, CheckCircle2, XCircle, ChevronRight, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface OrderCardProps {
    order: Order;
}

const statusColorMap = {
    'Processing': 'bg-blue-500',
    'Shipped': 'bg-amber-500',
    'Delivered': 'bg-green-500',
    'Cancelled': 'bg-red-500',
    'Returned': 'bg-gray-500',
};

const statusIconMap = {
    'Processing': Package,
    'Shipped': Truck,
    'Delivered': CheckCircle2,
    'Cancelled': XCircle,
    'Returned': RotateCcw,
};

export const OrderCard = ({ order }: OrderCardProps) => {
    const StatusIcon = statusIconMap[order.orderStatus];
    const firstItem = order.items[0];
    const otherItemsCount = order.items.length - 1;

    return (
        <motion.div
            whileHover={{ y: -5, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            <Link to={`/orders/${order._id}`}>
                <Card className="overflow-hidden border-border/40 hover:border-primary/50 transition-colors cursor-pointer group">
                    <CardContent className="p-0">
                        {/* Header */}
                        <div className="bg-muted/30 p-4 flex flex-wrap gap-4 justify-between items-center border-b">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${statusColorMap[order.orderStatus]} bg-opacity-10`}>
                                    <StatusIcon className={`w-5 h-5 ${statusColorMap[order.orderStatus].replace('bg-', 'text-')}`} />
                                </div>
                                <div>
                                    <div className="font-semibold text-sm">Order #{order._id.slice(-8).toUpperCase()}</div>
                                    <div className="text-xs text-muted-foreground">
                                        Placed on {new Date(order.dates.placed).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <div className="font-semibold text-sm">₹{order.totalAmount.toLocaleString()}</div>
                                    <Badge variant="secondary" className="text-xs font-normal">
                                        {order.orderStatus}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Body - First Item Preview */}
                        <div className="p-4 flex gap-4 items-center">
                            <div className="relative w-16 h-16 rounded-md overflow-hidden bg-white border shrink-0">
                                <img src={firstItem.image} alt={firstItem.name} className="object-contain w-full h-full" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm truncate">{firstItem.name}</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {firstItem.quantity} x ₹{firstItem.price.toLocaleString()}
                                </p>
                            </div>
                            {otherItemsCount > 0 && (
                                <div className="text-xs text-muted-foreground shrink-0 font-medium">
                                    + {otherItemsCount} more item{otherItemsCount > 1 ? 's' : ''}
                                </div>
                            )}
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </motion.div>
    );
};
