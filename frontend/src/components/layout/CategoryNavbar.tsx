import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, ChevronDown, Menu as MenuIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { categories } from '@/data/mockData';

// Types
interface Category {
    id: string;
    name: string;
    slug: string;
    featured?: boolean;
}

const CategoryNavbar = () => {
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Handle scroll effect for glassmorphism intensity
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <motion.nav
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={cn(
                    "w-full z-40 sticky top-[68px] transition-all duration-300",
                    "bg-blue-600/90 backdrop-blur-md border-t border-white/10 shadow-lg",
                    isScrolled ? "py-2" : "py-3"
                )}
            >
                <div className="container mx-auto px-4 flex items-center justify-between">
                    {/* Desktop Categories */}
                    <div className="hidden md:flex items-center gap-1 w-full justify-center">

                        {categories.map((category) => (
                            <CategoryItem
                                key={category.id}
                                category={category}
                                hoveredCategory={hoveredCategory}
                                setHoveredCategory={setHoveredCategory}
                            />
                        ))}

                        {/* Deals Special Item */}
                        <DealsItem />
                    </div>

                    {/* Mobile Hamburger */}
                    <div className="md:hidden flex items-center justify-between w-full">
                        <span className="text-white font-semibold text-lg">Categories</span>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-blue-700/95 backdrop-blur-xl border-t border-white/10 overflow-hidden"
                    >
                        <div className="container mx-auto py-4 px-4 flex flex-col space-y-2">
                            {categories.map((category) => (
                                <Link
                                    key={category.id}
                                    to={`/category/${category.slug}`}
                                    className="text-white/90 py-3 border-b border-white/10 text-lg font-medium hover:text-white hover:pl-2 transition-all"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {category.name}
                                </Link>
                            ))}
                            <Link
                                to="/deals"
                                className="text-orange-300 py-3 text-lg font-bold hover:text-orange-100 hover:pl-2 transition-all flex items-center gap-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <Flame size={20} className="text-orange-500 animate-pulse" />
                                Today's Deals
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// Individual Category Item with Magnetic Effect
const CategoryItem = ({ category, hoveredCategory, setHoveredCategory }: {
    category: any;
    hoveredCategory: string | null;
    setHoveredCategory: (id: string | null) => void;
}) => {
    const isHovered = hoveredCategory === category.id;

    return (
        <div
            className="relative px-4 py-2 group cursor-pointer"
            onMouseEnter={() => setHoveredCategory(category.id)}
            onMouseLeave={() => setHoveredCategory(null)}
        >
            <Link to={`/category/${category.slug}`} className="relative z-10 block px-2 py-1">
                <motion.span
                    className={cn(
                        "text-sm font-medium transition-colors duration-300 block relative z-20",
                        isHovered ? "text-blue-600" : "text-blue-100"
                    )}
                    animate={{
                        scale: isHovered ? 1.05 : 1,
                    }}
                >
                    {category.name}
                </motion.span>


            </Link>

            {/* Hover Glow & Background Pill */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        layoutId="navbar-pill"
                        className="absolute inset-0 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)] z-0"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                )}
            </AnimatePresence>

            {/* Mega Menu Dropdown with Blurish Glassmorphism */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: 10, scale: 0.95, filter: "blur(10px)" }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 p-1 rounded-2xl z-50 bg-gradient-to-br from-white/10 to-white/5 p-[1px] shadow-2xl backdrop-blur-xl border border-white/20"
                        style={{ perspective: "1000px" }}
                    >
                        {/* Inner Content Container */}
                        <div className="bg-[#0f1016]/80 backdrop-blur-3xl rounded-2xl p-5 overflow-hidden w-full h-full relative">
                            {/* Decorative Background Blobs */}
                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/30 rounded-full blur-[40px] pointer-events-none" />
                            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-purple-500/30 rounded-full blur-[40px] pointer-events-none" />

                            <h4 className="text-white font-bold mb-3 relative z-10 flex items-center gap-2">
                                {category.name}
                                <ChevronDown className="w-3 h-3 text-white/50" />
                            </h4>

                            <ul className="space-y-2 relative z-10 mb-4">
                                {['Top Rated', 'New Arrivals', 'Best Sellers'].map((item, idx) => (
                                    <motion.li
                                        key={item}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="text-gray-300 text-sm hover:text-white cursor-pointer hover:translate-x-1 transition-all flex items-center gap-2 group/item"
                                    >
                                        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full group-hover/item:bg-blue-400 transition-colors" />
                                        {item}
                                    </motion.li>
                                ))}
                            </ul>

                            <Link
                                to={`/category/${category.slug}`}
                                className="relative block h-28 rounded-xl overflow-hidden group/img shadow-md transform transition-transform hover:scale-[1.02] border border-white/10"
                            >
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover/img:opacity-40 transition-opacity" />
                                <span className="absolute bottom-2 left-2 px-2 py-1 bg-white/20 backdrop-blur-md border border-white/10 text-white font-bold text-[10px] rounded shadow-sm">
                                    FEATURED
                                </span>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


const DealsItem = () => {
    return (
        <Link to="/deals" className="relative group ml-4 p-[2px] rounded-full overflow-hidden">
            {/* Animated Moving Gradient Border (The "Moving Lines") */}
            <motion.div
                className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0_60deg,#fbbf24_70deg_100deg,transparent_110deg_360deg)]"
                animate={{ rotate: 360 }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />

            <div className="relative flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-full border border-orange-400/30 shadow-lg shadow-orange-500/20 z-10">
                {/* Animated Fire Icon */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0],
                        filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"]
                    }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                >
                    <Flame size={18} className="text-white fill-yellow-300" />
                </motion.div>

                <div className="flex flex-col leading-none">
                    <span className="text-xs font-bold text-orange-100 uppercase tracking-wider">Limited Time</span>
                    <span className="text-sm font-black text-white italic tracking-wide">
                        DEALS <span className="text-yellow-300">Hub</span>
                    </span>
                </div>

                {/* Live Badge */}
                <div className="ml-2 px-2 py-0.5 bg-white/20 rounded shadow-inner backdrop-blur-sm border border-white/10 animate-pulse">
                    <span className="text-[10px] font-bold text-white">LIVE</span>
                </div>
            </div>
        </Link>
    );
}


export default CategoryNavbar;
