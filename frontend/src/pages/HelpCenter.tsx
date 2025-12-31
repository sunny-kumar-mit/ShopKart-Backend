import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Search, Package, RefreshCw, CreditCard, User,
    Shield, TicketPercent, ChevronRight, MessageCircle,
    Phone, Mail, ChevronDown, Sparkles, ExternalLink,
    AlertCircle, FileText, ArrowRight, Loader2, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useChatStore } from '@/store/chatStore';
import { toast } from 'sonner';

// --- MOCK DATA ---

const HELP_CATEGORIES = [
    { id: 'orders', label: 'Orders & Delivery', icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'returns', label: 'Returns & Refunds', icon: RefreshCw, color: 'text-green-500', bg: 'bg-green-500/10' },
    { id: 'payments', label: 'Payments & Billing', icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'account', label: 'Account & Login', icon: User, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { id: 'coupons', label: 'Coupons & Offers', icon: TicketPercent, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { id: 'security', label: 'Security & Privacy', icon: Shield, color: 'text-red-500', bg: 'bg-red-500/10' },
];

const RECENT_ORDERS = [
    {
        id: 'ORD-2024-001',
        product: 'iPhone 15 Pro Max',
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200',
        date: 'Delivered on Dec 28, 2024',
        status: 'Delivered',
        statusColor: 'text-green-500'
    },
    {
        id: 'ORD-2024-002',
        product: 'Sony WH-1000XM5',
        image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=200',
        date: 'Arriving tomorrow',
        status: 'In Transit',
        statusColor: 'text-blue-500'
    }
];

const FAQS = [
    {
        question: "Where is my order?",
        answer: "You can track your order status in the 'My Orders' section. We also send real-time updates via SMS and Email."
    },
    {
        question: "How do I return a product?",
        answer: "Go to 'My Orders', select the product, and click 'Return'. Returns are accepted within 7 days of delivery for eligible items."
    },
    {
        question: "When will I get my refund?",
        answer: "Refunds are processed within 24-48 hours after the returned item reaches our warehouse. It may take 3-5 business days to reflect in your bank account."
    },
    {
        question: "How do I apply a coupon?",
        answer: "You can apply coupons at the checkout page or in your Cart summary. Look for the 'Apply Coupon' section to see eligible offers."
    }
];

// --- COMPONENTS ---

const OrderContextCard = ({ order }: { order: any }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        className="min-w-[300px] p-4 rounded-2xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200 dark:border-white/10 flex items-center gap-4 cursor-pointer hover:shadow-lg transition-all"
    >
        <img src={order.image} alt={order.product} className="w-16 h-16 rounded-lg object-cover bg-white" />
        <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{order.product}</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{order.id}</p>
            <p className={`text-xs font-medium ${order.statusColor}`}>{order.status} • {order.date}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-zinc-400" />
    </motion.div>
);

const CategoryTile = ({ category }: { category: any }) => (
    <motion.button
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.98 }}
        className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm hover:shadow-xl hover:bg-white/60 dark:hover:bg-zinc-800/60 transition-all group text-center h-full w-full"
    >
        <div className={`p-4 rounded-2xl mb-4 ${category.bg} group-hover:scale-110 transition-transform duration-300`}>
            <category.icon className={`w-8 h-8 ${category.color}`} />
        </div>
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{category.label}</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            View Articles
        </p>
    </motion.button>
);

const ContactOption = ({ icon: Icon, title, desc, action, color, onClick }: any) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        onClick={onClick}
        className="flex items-center gap-4 p-5 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 cursor-pointer transition-all"
    >
        <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{title}</h4>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{desc}</p>
        </div>
        <Button size="sm" variant="outline" className="rounded-full">
            {action}
        </Button>
    </motion.div>
);

export default function HelpCenter() {
    const { openChat } = useChatStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    // Modal States
    const [isCallModalOpen, setIsCallModalOpen] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form States (Basic)
    const [callFormData, setCallFormData] = useState({ name: '', phone: '', reason: '' });
    const [emailFormData, setEmailFormData] = useState({ name: '', email: '', subject: '', message: '' });

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const filteredFaqs = FAQS.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCallSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setIsCallModalOpen(false);
            toast.success("Callback requested successfully!", {
                description: "Our team will call you within 2 hours."
            });
            setCallFormData({ name: '', phone: '', reason: '' });
        }, 1500);
    };

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setIsEmailModalOpen(false);
            toast.success("Email sent successfully!", {
                description: "We've received your query. Ticket #SV-2024-889 created."
            });
            setEmailFormData({ name: '', email: '', subject: '', message: '' });
        }, 1500);
    };

    return (
        <Layout>
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden transition-colors duration-300">
                {/* Background Ambient Glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="container mx-auto max-w-6xl px-4 py-12 relative z-10">

                    {/* 1. HERO SEARCH SECTION */}
                    <div className="text-center mb-16 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2"
                        >
                            <Sparkles className="w-3 h-3" /> 24/7 Support
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white tracking-tight"
                        >
                            How can we help you?
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="max-w-2xl mx-auto relative group"
                        >
                            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative flex items-center bg-white dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-white/15 rounded-full shadow-2xl p-2 transition-all focus-within:ring-4 focus-within:ring-blue-500/20 focus-within:border-blue-500/50">
                                <Search className="w-6 h-6 text-zinc-400 ml-4" />
                                <Input
                                    className="flex-1 border-none shadow-none bg-transparent h-12 text-lg px-4 placeholder:text-zinc-400 focus-visible:ring-0"
                                    placeholder="Search for answers (e.g., 'refund', 'track order')"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Button size="lg" className="rounded-full px-8 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
                                    Search
                                </Button>
                            </div>
                        </motion.div>
                    </div>

                    {/* 2. CONTEXTUAL HELP (RECENT ORDERS) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-16"
                    >
                        <div className="flex items-center justify-between mb-6 px-2">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                <Package className="w-5 h-5 text-blue-500" /> Help with a recent purchase
                            </h2>
                            <Link to="/orders" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                                View all orders <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-6 px-2 no-scrollbar mask-gradient-x">
                            {RECENT_ORDERS.map((order) => (
                                <OrderContextCard key={order.id} order={order} />
                            ))}
                        </div>
                    </motion.div>

                    {/* 3. QUICK HELP CATEGORIES */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mb-20"
                    >
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 px-2">Browse by Category</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {HELP_CATEGORIES.map((category) => (
                                <CategoryTile key={category.id} category={category} />
                            ))}
                        </div>
                    </motion.div>

                    {/* 4. FAQs & CONTACT */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* FAQs */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="lg:col-span-2 space-y-8"
                        >
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                <FileText className="w-6 h-6 text-purple-500" /> Frequently Asked Questions
                            </h2>
                            <div className="space-y-4">
                                {filteredFaqs.length > 0 ? (
                                    filteredFaqs.map((faq, index) => (
                                        <div
                                            key={index}
                                            className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden"
                                            onMouseEnter={() => setOpenFaq(index)}
                                            onMouseLeave={() => setOpenFaq(null)}
                                        >
                                            <button
                                                onClick={() => toggleFaq(index)}
                                                className="w-full flex items-center justify-between p-5 text-left font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors"
                                            >
                                                {faq.question}
                                                <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                                            </button>
                                            <AnimatePresence>
                                                {openFaq === index && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="p-5 pt-0 text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-black/20">
                                                            {faq.answer}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p>No results found for "{searchQuery}". Try different keywords.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Contact Options */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-zinc-100/50 dark:bg-zinc-900/30 rounded-3xl p-6 border border-zinc-200 dark:border-white/5 h-fit"
                        >
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Need more help?</h3>
                            <div className="space-y-4">
                                <ContactOption
                                    icon={MessageCircle}
                                    title="Chat with Us"
                                    desc="Start a conversation now"
                                    action="Chat"
                                    color="bg-blue-500"
                                    onClick={openChat}
                                />
                                <ContactOption
                                    icon={Phone}
                                    title="Request Call"
                                    desc="We'll call you back"
                                    action="Request"
                                    color="bg-green-500"
                                    onClick={() => setIsCallModalOpen(true)}
                                />
                                <ContactOption
                                    icon={Mail}
                                    title="Email Support"
                                    desc="Get response via email"
                                    action="Email"
                                    color="bg-purple-500"
                                    onClick={() => setIsEmailModalOpen(true)}
                                />
                            </div>

                            <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-2xl flex gap-3">
                                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                                <p className="text-xs text-yellow-700 dark:text-yellow-500 font-medium">
                                    Support lines are busy due to high order volume. Wait times may be longer than usual.
                                </p>
                            </div>
                        </motion.div>
                    </div>

                </div>

                {/* --- MODALS --- */}

                {/* Request Call Modal */}
                <Dialog open={isCallModalOpen} onOpenChange={setIsCallModalOpen}>
                    <DialogContent className="sm:max-w-[425px] rounded-2xl">
                        <DialogHeader>
                            <DialogTitle>Request a Callback</DialogTitle>
                            <DialogDescription>
                                Leave your details and we'll call you back within 2 hours.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCallSubmit} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={callFormData.name}
                                    onChange={(e) => setCallFormData({ ...callFormData, name: e.target.value })}
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={callFormData.phone}
                                    onChange={(e) => setCallFormData({ ...callFormData, phone: e.target.value })}
                                    placeholder="+91 98765 43210"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="reason">Reason for Call</Label>
                                <Textarea
                                    id="reason"
                                    value={callFormData.reason}
                                    onChange={(e) => setCallFormData({ ...callFormData, reason: e.target.value })}
                                    placeholder="Briefly describe your issue..."
                                    required
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Requesting...
                                        </>
                                    ) : (
                                        "Request Callback"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Email Support Modal */}
                <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
                    <DialogContent className="sm:max-w-[500px] rounded-2xl">
                        <DialogHeader>
                            <DialogTitle>Email Support</DialogTitle>
                            <DialogDescription>
                                Send us a detailed message and we'll get back to you via email.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEmailSubmit} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email-name">Name</Label>
                                <Input
                                    id="email-name"
                                    value={emailFormData.name}
                                    onChange={(e) => setEmailFormData({ ...emailFormData, name: e.target.value })}
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={emailFormData.email}
                                    onChange={(e) => setEmailFormData({ ...emailFormData, email: e.target.value })}
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input
                                    id="subject"
                                    value={emailFormData.subject}
                                    onChange={(e) => setEmailFormData({ ...emailFormData, subject: e.target.value })}
                                    placeholder="Issue regarding..."
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    className="min-h-[100px]"
                                    value={emailFormData.message}
                                    onChange={(e) => setEmailFormData({ ...emailFormData, message: e.target.value })}
                                    placeholder="Describe your issue in detail..."
                                    required
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        "Send Message"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

            </div>
        </Layout>
    );
}
