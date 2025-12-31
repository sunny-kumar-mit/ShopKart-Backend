import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PaymentFailed() {
    return (
        <Layout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="bg-red-100 p-4 rounded-full mb-6 animate-in zoom-in duration-300">
                    <XCircle className="w-16 h-16 text-red-600" />
                </div>
                <h1 className="text-3xl font-bold mb-2 text-red-600">Payment Failed</h1>
                <p className="text-muted-foreground mb-8 max-w-md">
                    We couldn't process your payment. Please try again or check your payment details.
                </p>
                <div className="flex gap-4">
                    <Button asChild variant="outline">
                        <Link to="/checkout">
                            <RefreshCw className="w-4 h-4 mr-2" /> Try Again
                        </Link>
                    </Button>
                    <Button asChild variant="secondary">
                        <Link to="/cart">Go to Cart</Link>
                    </Button>
                </div>
            </div>
        </Layout>
    );
}
