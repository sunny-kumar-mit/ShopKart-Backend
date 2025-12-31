import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    X, Send, Sparkles, Minimize2, Maximize2
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { useChatStore } from '@/store/chatStore';
import { toast } from 'sonner';

// Sample context to feed to AI
import { COUPONS } from '@/data/mockData';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    action?: any;
}

export function ChatWidget() {
    const { isOpen, closeChat } = useChatStore();
    const [isMinimized, setIsMinimized] = useState(false);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hi! I'm your ShopKart AI Assistant. I'm here to help you with your order, returns, or finding the perfect product. How can I assist you?"
        }
    ]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { items } = useCartStore();

    // Auto-scroll to bottom
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSend = async (textOverride?: string) => {
        const text = textOverride || input;
        if (!text.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Prepare Context
            const context = {
                page: location.pathname,
                cartItemCount: items.length,
                availableCoupons: COUPONS.map(c => c.code),
            };

            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
                    context
                })
            });

            const data = await response.json();

            // Handle AI Action Response (JSON)
            if (data.action) {
                handleAiAction(data.action, data.params);
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: data.action === 'navigate' ? `I've navigated to that page for you.` :
                        data.action === 'addToCart' ? `I've added that to your cart.` :
                            data.action === 'applyCoupon' ? `I've applied that coupon for you.` :
                                `I've done that for you. Anything else?`
                }]);
            } else {
                // Standard Text Response
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: data.text || "I'm having trouble understanding that. Could you rephrase?"
                }]);
            }

        } catch (error) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: "Sorry, I'm having trouble connecting to the server. Please try again later."
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleAiAction = (action: string, params: any) => {
        console.log("AI Action:", action, params);
        switch (action) {
            case 'navigate':
                if (params.path) {
                    navigate(params.path);
                    toast.info(`Navigating to ${params.path}`);
                }
                break;
            case 'addToCart':
                toast.success(`added to cart (Simulation)`);
                break;
            case 'applyCoupon':
                toast.success(`Coupon ${params.code} applied!`);
                break;
            case 'trackOrder':
                navigate('/orders');
                toast.info(`Tracking order ${params.orderId}`);
                break;
            default:
                break;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    className={`fixed bottom-6 right-6 z-[100] w-[350px] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${isMinimized ? 'h-20' : 'h-[500px]'}`}
                >
                    {/* HEADER */}
                    <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">ShopKart AI</h3>
                                <p className="text-[10px] text-green-500 font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Online
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsMinimized(!isMinimized)}>
                                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-red-500/10 hover:text-red-500" onClick={() => closeChat()}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* MESSAGES AREA */}
                    {!isMinimized && (
                        <>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/50 dark:bg-black/20">
                                {messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                                ? 'bg-blue-600 text-white rounded-br-none'
                                                : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-100 dark:border-zinc-700 rounded-bl-none'
                                                }`}
                                        >
                                            {msg.content}
                                        </div>
                                    </motion.div>
                                ))}

                                {/* SUGGESTED QUESTIONS */}
                                {messages.length === 1 && (
                                    <div className="grid grid-cols-1 gap-2 mt-4 px-2">
                                        {[
                                            { label: "📦 Where is my order?", text: "Where is my order?" },
                                            { label: "💳 Refund status?", text: "Check my refund status" },
                                            { label: "🏷️ Available coupons", text: "Are there any coupons?" },
                                            { label: "↩️ How to return?", text: "How do I return an item?" },
                                        ].map((opt, i) => (
                                            <motion.button
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                onClick={() => handleSend(opt.text)}
                                                className="text-left text-xs p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                                            >
                                                {opt.label}
                                            </motion.button>
                                        ))}
                                    </div>
                                )}

                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white dark:bg-zinc-800 p-3 rounded-2xl rounded-bl-none border border-zinc-100 dark:border-zinc-700 flex gap-1">
                                            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* INPUT AREA */}
                            <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
                                <form
                                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                    className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800/50 p-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all"
                                >
                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Ask anything..."
                                        className="flex-1 border-none shadow-none bg-transparent h-9 px-4 focus-visible:ring-0 text-sm"
                                    />
                                    <Button
                                        type="submit"
                                        size="icon"
                                        disabled={!input.trim() || loading}
                                        className="h-9 w-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md disabled:opacity-50"
                                    >
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </form>
                                <div className="text-center mt-2">
                                    <p className="text-[10px] text-muted-foreground">Powered by OpenAI GPT-4o</p>
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
