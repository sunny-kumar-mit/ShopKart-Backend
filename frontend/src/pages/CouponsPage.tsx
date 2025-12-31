import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import {
    TicketPercent, Copy, Clock, ShoppingBag,
    ArrowRight, Check, Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { COUPONS, PERSONAL_OFFERS } from '@/data/mockData';

// --- MOCK DATA ---

const CATEGORIES = ["All", "Electronics", "Fashion", "Beauty", "Home", "Bank Offers"];

const CouponCard = ({ coupon }: { coupon: any }) => {
    const [copied, setCopied] = useState(false);

    const calculateTimeLeft = () => {
        const difference = +new Date(coupon.expiry) - +new Date();
        return difference > 0 ? Math.floor(difference / (1000 * 60 * 60 * 24)) : 0;
    };

    const daysLeft = calculateTimeLeft();
    const isExpiringSoon = daysLeft < 3;

    const copyCode = () => {
        navigator.clipboard.writeText(coupon.code);
        setCopied(true);
        toast.success("Coupon code copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="group relative flex flex-col md:flex-row bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all"
        >
            {/* Left Accent Bar */}
            <div className={`absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-b ${coupon.color}`} />

            {/* Content Section */}
            <div className="flex-1 p-6 z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r ${coupon.color} text-white shadow-sm`}>
                            {coupon.category}
                        </span>
                        {isExpiringSoon && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-500/30 animate-pulse">
                                <Clock className="w-3 h-3" /> Expiring Soon
                            </span>
                        )}
                    </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {coupon.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 mb-4 leading-relaxed">
                    {coupon.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500 dark:text-white/50">
                    <div className="flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Min Spend: ₹{coupon.minPurchase}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Expires in {daysLeft} days
                    </div>
                </div>
            </div>

            {/* Right/Bottom Action Section */}
            <div className="relative p-6 flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 bg-white/20 dark:bg-black/20 md:border-l border-t md:border-t-0 border-white/10">
                {/* Dashed Separator Visuals */}
                <div className="absolute -top-3 md:top-auto md:-left-3 left-1/2 md:left-auto md:bottom-auto w-6 h-6 bg-gray-50 dark:bg-zinc-950 rounded-full z-20" />
                <div className="absolute -bottom-3 md:bottom-auto md:-left-3 left-1/2 md:left-auto md:top-auto w-6 h-6 bg-gray-50 dark:bg-zinc-950 rounded-full z-20" />

                <div className="text-center">
                    <div className="text-xs text-gray-500 dark:text-muted-foreground uppercase tracking-widest mb-1">Code</div>
                    <button
                        onClick={copyCode}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-dashed border-gray-300 dark:border-white/20 rounded-xl transition-all font-mono text-lg font-bold tracking-wider text-primary"
                    >
                        {coupon.code}
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 opacity-50" />}
                    </button>
                </div>

                <Button
                    className="w-full"
                    onClick={() => toast.success(`Applied ${coupon.code} to your cart!`)}
                >
                    Apply <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </motion.div>
    );
};

export default function CouponsPage() {
    const [selectedCategory, setSelectedCategory] = useState("All");

    const filteredCoupons = selectedCategory === "All"
        ? COUPONS
        : COUPONS.filter(c => c.category === selectedCategory || c.type === (selectedCategory === "Bank Offers" ? "bank" : ""));

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 relative overflow-hidden transition-colors duration-300">
                {/* Background Ambient Glows - Softer */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-normal" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-normal" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-normal" />

                <div className="container mx-auto max-w-5xl px-4 py-12 relative z-10">

                    {/* Header */}
                    <div className="mb-12 text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight"
                        >
                            Rewards & Coupons
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { delay: 0.2 } }}
                            className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto"
                        >
                            Exclusive deals curated just for you. Save big on your favorite brands.
                        </motion.p>
                    </div>

                    {/* Personal Offers - "For You" Section */}
                    {PERSONAL_OFFERS.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-[23px] p-8 md:p-10 relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10">
                                    <Sparkles className="w-32 h-32 text-yellow-500" />
                                </div>
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 border border-yellow-200 dark:border-yellow-500/20">
                                                <Sparkles className="w-3 h-3" /> Recommended For You
                                            </span>
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                            {PERSONAL_OFFERS[0].title}
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                                            {PERSONAL_OFFERS[0].message}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center bg-gray-50 dark:bg-black/20 rounded-2xl p-4 border border-gray-100 dark:border-white/10 max-w-xs w-full text-center">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Unlock Code</span>
                                        <div className="text-yellow-600 dark:text-yellow-500 text-xl font-mono font-bold tracking-wider mb-2">
                                            {PERSONAL_OFFERS[0].code}
                                        </div>
                                        <div className="text-xs text-red-500 dark:text-red-400 font-medium flex items-center justify-center gap-1">
                                            <Clock className="w-3 h-3" /> Expires in {PERSONAL_OFFERS[0].expiry}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Category Filter Tabs */}
                    <div className="flex overflow-x-auto pb-4 gap-2 mb-8 no-scrollbar mask-gradient-x justify-start md:justify-center">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={cn(
                                    "px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300",
                                    selectedCategory === cat
                                        ? "bg-gray-900 text-white dark:bg-white dark:text-black shadow-lg scale-105"
                                        : "bg-white text-gray-600 dark:bg-white/5 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Coupons Grid */}
                    <motion.div
                        layout
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        <AnimatePresence>
                            {filteredCoupons.map((coupon) => (
                                <CouponCard key={coupon.id} coupon={coupon} />
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {/* Empty State */}
                    {filteredCoupons.length === 0 && (
                        <div className="text-center py-20 opacity-50">
                            <TicketPercent className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                            <p className="text-xl text-gray-500 dark:text-gray-400">No coupons available in this category yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
