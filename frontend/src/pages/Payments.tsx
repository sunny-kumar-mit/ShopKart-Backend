import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { CreditCard, Plus, Trash2, History, Smartphone, ShieldCheck, Wallet, X, Download } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

// Initial Mock Data
const INITIAL_CARDS = [
    {
        id: 1,
        type: 'Visa',
        last4: '4242',
        expiry: '12/28',
        bank: 'HDFC Bank',
        gradient: 'bg-gradient-to-br from-[#1a1c2e] to-[#0f1016] border border-white/10'
    },
    {
        id: 2,
        type: 'Mastercard',
        last4: '8888',
        expiry: '09/25',
        bank: 'ICICI Bank',
        gradient: 'bg-gradient-to-br from-[#2b1c1c] to-[#1a0f0f] border border-white/10'
    }
];

const INITIAL_UPI_IDS = [
    { id: 1, vpa: 'sunny@oksbi', bank: 'State Bank of India', verified: true },
    { id: 2, vpa: 'sunny.kumar@axl', bank: 'Axis Bank', verified: true }
];

const TRANSACTIONS = [
    { id: 101, item: 'Apple iPhone 15 Pro Max', date: 'Oct 24, 2024', amount: '₹1,59,900', status: 'Success' },
    { id: 102, item: 'Sony WH-1000XM5', date: 'Sep 12, 2024', amount: '₹29,990', status: 'Success' },
    { id: 103, item: 'Nike Air Jordan', date: 'Aug 05, 2024', amount: '₹12,495', status: 'Refunded' },
    { id: 104, item: 'Samsung Galaxy S24 Ultra', date: 'Jul 20, 2024', amount: '₹1,29,999', status: 'Success' },
];

export default function Payments() {
    const { user } = useAuthStore();
    const userName = user?.name || 'Sunny Kumar';

    const [activeTab, setActiveTab] = useState<'methods' | 'history'>('methods');
    const [cards, setCards] = useState(INITIAL_CARDS);
    const [upiIds, setUpiIds] = useState(INITIAL_UPI_IDS);

    // Dialog States
    const [isAddCardOpen, setIsAddCardOpen] = useState(false);
    const [isAddUpiOpen, setIsAddUpiOpen] = useState(false);
    const [viewingReceipt, setViewingReceipt] = useState<any | null>(null);

    // Form States
    const [newCard, setNewCard] = useState({ number: '', expiry: '', cvv: '', name: userName });
    const [newUpi, setNewUpi] = useState('');

    const handleAddCard = () => {
        if (newCard.number.length < 16 || !newCard.expiry || !newCard.cvv) {
            toast.error("Please fill all card details correctly");
            return;
        }

        const id = Math.max(...cards.map(c => c.id), 0) + 1;
        const last4 = newCard.number.slice(-4);
        // Simple bank detection simulation
        const bank = parseInt(last4) % 2 === 0 ? 'HDFC Bank' : 'SBI Card';
        const type = newCard.number.startsWith('4') ? 'Visa' : 'Mastercard';
        const gradient = type === 'Visa'
            ? 'bg-gradient-to-br from-[#1a1c2e] to-[#0f1016] border border-white/10'
            : 'bg-gradient-to-br from-[#2b1c1c] to-[#1a0f0f] border border-white/10';

        const card = {
            id,
            type,
            last4,
            expiry: newCard.expiry,
            bank,
            gradient
        };

        setCards([...cards, card]);
        setNewCard({ number: '', expiry: '', cvv: '', name: userName });
        setIsAddCardOpen(false);
        toast.success("New card added successfully");
    };

    const handleDeleteCard = (id: number) => {
        setCards(cards.filter(c => c.id !== id));
        toast.success("Card removed successfully");
    };

    const handleAddUpi = () => {
        if (!newUpi.includes('@')) {
            toast.error("Invalid UPI ID format");
            return;
        }
        const id = Math.max(...upiIds.map(u => u.id), 0) + 1;
        const bank = 'New Bank'; // In a real app, verify VPA to get bank
        setUpiIds([...upiIds, { id, vpa: newUpi, bank, verified: true }]);
        setNewUpi('');
        setIsAddUpiOpen(false);
        toast.success("UPI ID added successfully");
    };

    const handleDeleteUpi = (id: number) => {
        setUpiIds(upiIds.filter(u => u.id !== id));
        toast.success("UPI ID removed successfully");
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50/50 dark:bg-black/20 py-12">
                <div className="container mx-auto max-w-5xl px-4">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                                Payment Methods
                            </h1>
                            <p className="text-muted-foreground mt-1">Manage your saved cards, UPI, and view transactions.</p>
                        </div>
                        <Button
                            onClick={() => setIsAddCardOpen(true)}
                            className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 shadow-lg shadow-primary/25 transition-all hover:scale-105"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add New Method
                        </Button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-6 border-b border-gray-200 dark:border-gray-800 mb-8">
                        <button
                            onClick={() => setActiveTab('methods')}
                            className={cn(
                                "pb-3 text-sm font-medium transition-all relative",
                                activeTab === 'methods'
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Saved Methods
                            {activeTab === 'methods' && (
                                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={cn(
                                "pb-3 text-sm font-medium transition-all relative",
                                activeTab === 'history'
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Transaction History
                            {activeTab === 'history' && (
                                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
                            )}
                        </button>
                    </div>

                    {activeTab === 'methods' ? (
                        <div className="space-y-12">
                            {/* Saved Cards Section */}
                            <section>
                                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-primary" /> Saved Cards
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <AnimatePresence>
                                        {cards.map((card) => (
                                            <motion.div
                                                key={card.id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                whileHover={{ y: -5 }}
                                                className={cn(
                                                    "relative h-48 rounded-2xl p-6 flex flex-col justify-between shadow-2xl overflow-hidden group cursor-pointer",
                                                    card.gradient
                                                )}
                                            >
                                                {/* Glass Shine Effect */}
                                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 blur-3xl rounded-full pointer-events-none" />

                                                <div className="flex justify-between items-start z-10">
                                                    <div className="text-white/80 font-medium tracking-wider">{card.bank}</div>
                                                    {card.type === 'Visa' ? (
                                                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 invert opacity-80" />
                                                    ) : (
                                                        <div className="flex flex-col gap-0.5">
                                                            <div className="w-6 h-6 rounded-full bg-red-500/80" />
                                                            <div className="w-6 h-6 rounded-full bg-yellow-500/80 -mt-4 ml-3" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="z-10">
                                                    <div className="flex gap-4 items-center mb-4">
                                                        <div className="w-10 h-6 bg-yellow-500/20 rounded-md border border-yellow-500/30 flex items-center justify-center">
                                                            <div className="w-6 h-4 bg-yellow-500/40 rounded-[2px]" />
                                                        </div>
                                                        <div className="text-white text-lg tracking-[0.2em] font-mono">**** **** **** {card.last4}</div>
                                                    </div>

                                                    <div className="flex justify-between items-end text-white/70 text-xs">
                                                        <div>
                                                            <div className="uppercase tracking-wider opacity-60 text-[10px]">Card Holder</div>
                                                            <div className="text-white font-medium text-sm mt-0.5 uppercase">{userName}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="uppercase tracking-wider opacity-60 text-[10px]">Expires</div>
                                                            <div className="text-white font-medium text-sm mt-0.5">{card.expiry}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        size="icon"
                                                        variant="destructive"
                                                        className="h-8 w-8 rounded-full shadow-lg"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteCard(card.id);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {/* Add New Card Placeholder */}
                                    <motion.div
                                        onClick={() => setIsAddCardOpen(true)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="h-48 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all"
                                    >
                                        <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <Plus className="h-6 w-6" />
                                        </div>
                                        <span className="font-medium">Add New Card</span>
                                    </motion.div>
                                </div>
                            </section>

                            {/* UPI Section */}
                            <section>
                                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                    <Smartphone className="h-5 w-5 text-primary" /> UPI IDs
                                </h2>
                                <div className="bg-white dark:bg-[#121216] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                                    <AnimatePresence>
                                        {upiIds.map((upi, index) => (
                                            <motion.div
                                                key={upi.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20, height: 0 }}
                                                className={cn(
                                                    "flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors",
                                                    index !== upiIds.length - 1 ? "border-b border-gray-100 dark:border-white/5" : ""
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300">
                                                        <Wallet className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-foreground flex items-center gap-2">
                                                            {upi.vpa}
                                                            {upi.verified && <ShieldCheck className="h-3.5 w-3.5 text-green-500" />}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">{upi.bank}</div>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-gray-400 hover:text-red-500"
                                                    onClick={() => handleDeleteUpi(upi.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    <div className="p-4 bg-gray-50 dark:bg-white/5 text-center">
                                        <Button
                                            variant="link"
                                            className="text-primary font-semibold"
                                            onClick={() => setIsAddUpiOpen(true)}
                                        >
                                            <Plus className="h-4 w-4 mr-2" /> Add New UPI ID
                                        </Button>
                                    </div>
                                </div>
                            </section>
                        </div>
                    ) : (
                        /* Transaction History Tab */
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white dark:bg-[#121216] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm"
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                                        <tr>
                                            <th className="text-left py-4 px-6 text-xs uppercase tracking-wider text-muted-foreground font-semibold">Item</th>
                                            <th className="text-left py-4 px-6 text-xs uppercase tracking-wider text-muted-foreground font-semibold">Date</th>
                                            <th className="text-left py-4 px-6 text-xs uppercase tracking-wider text-muted-foreground font-semibold">Amount</th>
                                            <th className="text-left py-4 px-6 text-xs uppercase tracking-wider text-muted-foreground font-semibold">Status</th>
                                            <th className="text-right py-4 px-6 text-xs uppercase tracking-wider text-muted-foreground font-semibold">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {TRANSACTIONS.map((tx) => (
                                            <tr key={tx.id} className="group border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                            <Package className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                        <span className="font-medium text-foreground">{tx.item}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-muted-foreground">{tx.date}</td>
                                                <td className="py-4 px-6 font-medium">{tx.amount}</td>
                                                <td className="py-4 px-6">
                                                    <span className={cn(
                                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                                        tx.status === 'Success'
                                                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                    )}>
                                                        {tx.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-primary"
                                                        onClick={() => setViewingReceipt(tx)}
                                                    >
                                                        View Receipt
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Add Card Dialog */}
            <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Card</DialogTitle>
                        <DialogDescription>
                            Enter your card details securely. We verify transaction capability with a small refundable charge.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Card Holder Name</Label>
                            <Input id="name" value={newCard.name} onChange={(e) => setNewCard({ ...newCard, name: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="number">Card Number</Label>
                            <Input id="number" placeholder="0000 0000 0000 0000" maxLength={19} value={newCard.number} onChange={(e) => setNewCard({ ...newCard, number: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="expiry">Expiry Date</Label>
                                <Input id="expiry" placeholder="MM/YY" maxLength={5} value={newCard.expiry} onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="cvv">CVV</Label>
                                <Input id="cvv" placeholder="123" maxLength={3} type="password" value={newCard.cvv} onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddCardOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddCard}>Add Card</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add UPI Dialog */}
            <Dialog open={isAddUpiOpen} onOpenChange={setIsAddUpiOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New UPI ID</DialogTitle>
                        <DialogDescription>
                            Link your UPI ID for faster payments. We will verify it with a ping.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="vpa">Virtual Payment Address (VPA)</Label>
                            <Input id="vpa" placeholder="username@bank" value={newUpi} onChange={(e) => setNewUpi(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddUpiOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddUpi}>Verify & Add</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Receipt Dialog */}
            <Dialog open={!!viewingReceipt} onOpenChange={(open) => !open && setViewingReceipt(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Transaction Receipt</DialogTitle>
                        <DialogDescription>
                            Receipt for transaction #{viewingReceipt?.id}
                        </DialogDescription>
                    </DialogHeader>
                    {viewingReceipt && (
                        <div className="py-4 space-y-4">
                            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                                <span className="font-medium text-lg">{viewingReceipt.item}</span>
                                <span className="font-bold text-lg">{viewingReceipt.amount}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground block mb-1">Date</span>
                                    <span className="font-medium">{viewingReceipt.date}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block mb-1">Status</span>
                                    <span className={cn(
                                        "font-medium",
                                        viewingReceipt.status === 'Success' ? "text-green-600" : "text-yellow-600"
                                    )}>{viewingReceipt.status}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block mb-1">Payment Method</span>
                                    <span className="font-medium">HDFC Bank Visa **** 4242</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block mb-1">Transaction ID</span>
                                    <span className="font-medium font-mono text-xs">TXN738292837482</span>
                                </div>
                            </div>

                            <div className="border-t pt-4 mt-4">
                                <div className="flex justify-between text-sm mb-2">
                                    <span>Subtotal</span>
                                    <span>{viewingReceipt.amount}</span>
                                </div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span>Tax (18% GST)</span>
                                    <span>Included</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-dashed">
                                    <span>Total Paid</span>
                                    <span>{viewingReceipt.amount}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" className="w-full sm:w-auto">
                            <Download className="mr-2 h-4 w-4" /> Download PDF
                        </Button>
                        <Button onClick={() => setViewingReceipt(null)} className="w-full sm:w-auto">Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Layout>
    );
}

// Icon helper
function Package(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m7.5 4.27 9 5.15" />
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
        </svg>
    )
}
