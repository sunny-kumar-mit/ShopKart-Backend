import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PaymentSuccess() {
    return (
        <Layout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="bg-green-100 p-4 rounded-full mb-6 animate-in zoom-in duration-300">
                    <CheckCircle2 className="w-16 h-16 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
                <p className="text-muted-foreground mb-8 max-w-md">
                    Thank you for your purchase. We have received your order and it will be processed shortly.
                </p>
                <div className="flex gap-4">
                    <Button asChild variant="outline">
                        <Link to="/orders">View My Orders</Link>
                    </Button>
                    <Button asChild>
                        <Link to="/">
                            <ShoppingBag className="w-4 h-4 mr-2" /> Continue Shopping
                        </Link>
                    </Button>
                </div>
            </div>
        </Layout>
    );
}
