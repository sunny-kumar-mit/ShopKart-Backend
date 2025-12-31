import { CheckCircle2, Circle, XCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OrderStatus, OrderDates } from '@/types/order';

interface OrderTimelineProps {
    status: OrderStatus;
    dates: OrderDates;
}

const steps = [
    { label: 'Order Placed', key: 'placed' },
    { label: 'Shipped', key: 'shipped' },
    { label: 'Delivered', key: 'delivered' },
];

export const OrderTimeline = ({ status, dates }: OrderTimelineProps) => {
    // Determine active step index
    let activeIndex = -1;
    let isCancelled = status === 'Cancelled';
    let isReturned = status === 'Returned';

    if (status === 'Processing') activeIndex = 0;
    else if (status === 'Shipped') activeIndex = 1;
    else if (status === 'Delivered' || status === 'Returned') activeIndex = 2; // Returned implies delivery happened

    // Override if cancelled/returned to show special state
    if (isCancelled) activeIndex = 0; // Show processed but then cancelled

    const getIcon = (index: number) => {
        if (isCancelled && index === 1) return <XCircle className="w-6 h-6 text-red-500 bg-white z-10" />;
        if (isReturned && index === 2) return <RotateCcw className="w-6 h-6 text-orange-500 bg-white z-10" />;

        if (index <= activeIndex) {
            return <CheckCircle2 className="w-6 h-6 text-green-500 bg-white z-10" />;
        }
        return <Circle className="w-6 h-6 text-gray-300 bg-white z-10" />;
    };

    return (
        <div className="relative flex flex-col md:flex-row justify-between w-full max-w-3xl mx-auto py-8">
            {/* Connecting Line */}
            <div className="absolute top-8 left-3 md:left-0 md:top-1/2 md:-translate-y-1/2 w-0.5 h-[calc(100%-4rem)] md:w-full md:h-0.5 bg-gray-200 -z-0"></div>

            {/* Progress Line */}
            <div
                className={cn(
                    "absolute top-8 left-3 md:left-0 md:top-1/2 md:-translate-y-1/2 w-0.5 md:h-0.5 bg-green-500 transition-all duration-500 -z-0",
                    isCancelled ? "bg-red-500" : "",
                    isReturned ? "bg-orange-500" : ""
                )}
                style={{
                    height: window.innerWidth < 768 ? `${(activeIndex / (steps.length - 1)) * 80}%` : '2px', // Approx height for mobile
                    width: window.innerWidth >= 768 ? `${(activeIndex / (steps.length - 1)) * 100}%` : '2px'
                }}
            ></div>

            {steps.map((step, index) => {
                const dateKey = step.key as keyof OrderDates;
                const dateVal = dates[dateKey];

                return (
                    <div key={step.key} className="relative flex md:flex-col items-center gap-4 md:gap-2 mb-8 md:mb-0">
                        {getIcon(index)}
                        <div className="flex flex-col md:items-center">
                            <span className={cn(
                                "text-sm font-medium",
                                index <= activeIndex ? "text-foreground" : "text-muted-foreground"
                            )}>
                                {step.label}
                            </span>
                            {dateVal && (
                                <span className="text-xs text-muted-foreground">
                                    {new Date(dateVal).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}

            {/* Extra Step for Cancelled/Returned display if applicable */}
            {isCancelled && (
                <div className="relative flex md:flex-col items-center gap-4 md:gap-2">
                    <XCircle className="w-6 h-6 text-red-500 bg-white z-10" />
                    <div className="flex flex-col md:items-center">
                        <span className="text-sm font-medium text-red-600">Cancelled</span>
                        {dates.cancelled && (
                            <span className="text-xs text-muted-foreground">
                                {new Date(dates.cancelled).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>
            )}
            {isReturned && (
                <div className="relative flex md:flex-col items-center gap-4 md:gap-2">
                    <RotateCcw className="w-6 h-6 text-orange-500 bg-white z-10" />
                    <div className="flex flex-col md:items-center">
                        <span className="text-sm font-medium text-orange-600">Returned</span>
                        {dates.returned && (
                            <span className="text-xs text-muted-foreground">
                                {new Date(dates.returned).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
