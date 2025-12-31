import { useState, useEffect, useRef } from 'react';
import { Search, X, Mic, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onSearch?: () => void;
}

const PLACEHOLDERS = [
    "Search for iPhones, Laptops, Headphones",
    "Try Nike Shoes, Adidas, Puma",
    "Find Best Deals Today 🔥",
    "Search Smart TVs under ₹30,000"
];

// Add type definition for Web Speech API
declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

export default function SearchBar({ value, onChange, onSearch }: SearchBarProps) {
    const [placeholder, setPlaceholder] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // Voice Search State
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    const inputRef = useRef<HTMLInputElement>(null);

    // Typewriter effect logic
    useEffect(() => {
        if (isFocused || value) {
            setPlaceholder(PLACEHOLDERS[placeholderIndex]);
            return;
        }

        const currentText = PLACEHOLDERS[placeholderIndex];
        const typeSpeed = isDeleting ? 30 : 60;
        const pauseDuration = 1500;

        if (isPaused) {
            const timeout = setTimeout(() => {
                setIsPaused(false);
                setIsDeleting(true);
            }, pauseDuration);
            return () => clearTimeout(timeout);
        }

        const timeout = setTimeout(() => {
            if (!isDeleting) {
                // Typing
                if (charIndex < currentText.length) {
                    setPlaceholder(currentText.substring(0, charIndex + 1));
                    setCharIndex((prev) => prev + 1);
                } else {
                    // Finished typing, pause
                    setIsPaused(true);
                }
            } else {
                // Deleting
                if (charIndex > 0) {
                    setPlaceholder(currentText.substring(0, charIndex - 1));
                    setCharIndex((prev) => prev - 1);
                } else {
                    // Finished deleting, move to next string
                    setIsDeleting(false);
                    setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
                }
            }
        }, typeSpeed);

        return () => clearTimeout(timeout);
    }, [charIndex, isDeleting, isPaused, placeholderIndex, isFocused, value]);

    // Handle Clear
    const handleClear = () => {
        onChange('');
        inputRef.current?.focus();
    };

    // Handle Voice Search
    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const startListening = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onstart = () => {
                setIsListening(true);
                toast.info('Listening... Speak now');
            };

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                onChange(transcript);
                setIsListening(false);
                // Optional: Auto-search after voice input
                setTimeout(() => {
                    onSearch?.();
                }, 500);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
                toast.error('Voice search failed. Please try again.');
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current.start();
        } else {
            toast.error('Voice search is not supported in this browser.');
        }
    };

    const toggleVoiceSearch = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    return (
        <div className="relative w-full max-w-2xl group">
            {/* Glow Effect on Focus */}
            <AnimatePresence>
                {isFocused && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1.02 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute inset-0 -z-10 bg-yellow-400/30 blur-xl rounded-full"
                    />
                )}
            </AnimatePresence>

            <motion.div
                className={cn(
                    "relative flex items-center w-full h-11 bg-white rounded-full overflow-hidden transition-all duration-300",
                    "border-2",
                    isFocused ? "border-yellow-400 shadow-md" : "border-gray-100 shadow-sm hover:border-gray-200"
                )}
                animate={{ scale: isFocused ? 1.01 : 1 }}
                transition={{ duration: 0.2 }}
            >
                {/* Search Icon */}
                <button
                    className="pl-4 pr-2 text-gray-400 cursor-pointer hover:text-blue-600 transition-colors bg-transparent border-0"
                    onClick={() => onSearch?.()}
                >
                    <motion.div
                        animate={isFocused ? { rotate: [0, -10, 10, 0], scale: 1.1 } : { scale: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Search className={cn("w-5 h-5", isFocused ? "text-blue-600" : "text-gray-400")} />
                    </motion.div>
                </button>

                {/* Input Field */}
                <input
                    ref={inputRef}
                    type="text"
                    className="w-full h-full bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 text-sm font-medium"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={(e) => e.key === 'Enter' && onSearch?.()}
                />

                {/* Typewriter Placeholder Overlay (Absolute) */}
                {!value && !isFocused && (
                    <div className="absolute left-11 top-0 bottom-0 flex items-center pointer-events-none">
                        <span className="text-gray-400 text-sm">{placeholder}</span>
                        <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className="w-0.5 h-5 bg-blue-500 ml-0.5"
                        />
                    </div>
                )}

                {/* Right Actions */}
                <div className="pr-2 flex items-center gap-1">
                    <AnimatePresence>
                        {value && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={handleClear}
                                className="p-1 hover:bg-gray-100 rounded-full text-gray-500"
                            >
                                <X size={16} />
                            </motion.button>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={toggleVoiceSearch}
                        className={cn(
                            "p-2 rounded-full transition-all group/mic",
                            isListening ? "bg-red-100 text-red-600 animate-pulse" : "hover:bg-blue-50 text-blue-600"
                        )}
                    >
                        {isListening ? (
                            <Mic size={18} className="scale-110" />
                        ) : (
                            <Mic size={18} className="group-hover/mic:scale-110 transition-transform" />
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
