import { motion } from 'framer-motion';
import { Star, ShoppingCart, Eye, Heart } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useWishlistStore } from '@/store/wishlistStore';
import { useNavigate } from 'react-router-dom';

interface ProductPopCartProps {
    product: Product;
    onAddToCart: (e: React.MouseEvent) => void;
    isMobile?: boolean;
    onClose?: () => void;
    position?: 'left' | 'right' | 'center';
}

export function ProductPopCart({ product, onAddToCart, isMobile, onClose, position = 'center' }: ProductPopCartProps) {
    const { isInWishlist, addItem: toggleWishlist, removeItem } = useWishlistStore();
    const isWishlisted = isInWishlist(product.id);
    const navigate = useNavigate();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const handleWishlistClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isWishlisted) {
            removeItem(product.id);
        } else {
            toggleWishlist(product);
        }
    };

    const handleViewDetails = (e: React.MouseEvent) => {
        e.preventDefault();
        // e.stopPropagation() is NOT needed here if we want the parent to also click, 
        // but since this is an overlay, we probably should handle it explicitly.
        // Actually, preventing default is enough as we are using navigate.
        navigate(`/product/${product.id}`);
    };

    // Apple-style subtle spring config
    const springConfig = { type: "spring" as const, stiffness: 350, damping: 25 };

    // Smart positioning styles
    const positionStyles = isMobile ? "fixed bottom-0 left-0 right-0 w-full rounded-t-3xl rounded-b-none h-auto p-6 translate-x-0 !transform-none" : cn(
        "top-[-50px] w-[650px] h-[360px] p-0 flex",
        position === 'left' ? "left-0" :
            position === 'right' ? "right-0" :
                "left-1/2" // Center requires translate-x-50 which is handled by motion x prop
    );

    // Animate x based on position (only center needs -50% translate)
    const xValue = isMobile ? 0 : (position === 'center' ? "-50%" : 0);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10, x: xValue, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, x: xValue, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, y: 10, x: xValue, filter: "blur(4px)" }}
            transition={springConfig}
            className={cn(
                "absolute z-50 bg-[#121216]/95 backdrop-blur-3xl border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] rounded-3xl overflow-hidden",
                positionStyles
            )}
            onClick={(e) => e.preventDefault()} // Keep this to prevent event bubbling if needed
        >
            {/* Mobile Handle */}
            {isMobile && (
                <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" onClick={onClose} />
            )}

            {/* Dynamic Background Gradient Blob */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Left Side: Large Image Area */}
            <div
                className={cn(
                    "relative overflow-hidden group-hover/card:shadow-inner cursor-pointer",
                    isMobile ? "w-full aspect-square rounded-2xl mb-4" : "w-[45%] h-full shrink-0"
                )}
                onClick={handleViewDetails}
            >
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />

                {/* Overlay Gradient for Text Contrast just in case */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

                {/* Price Tag Overlay (Top Left) */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                    <span className="text-white font-semibold text-sm">{formatPrice(product.price)}</span>
                    {product.discount && (
                        <span className="text-[10px] font-bold bg-white text-black px-1.5 py-0.5 rounded-sm">-{product.discount}%</span>
                    )}
                </div>

                {/* Wishlist Button (Top Right) */}
                <button
                    onClick={handleWishlistClick}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/30 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors shadow-lg z-20"
                >
                    <Heart className={cn("w-4 h-4", isWishlisted ? "fill-rose-500 text-rose-500" : "text-white")} />
                </button>
            </div>

            {/* Right Side: Info Area */}
            <div className={cn(
                "flex flex-col h-full",
                isMobile ? "w-full" : "w-[55%] p-6"
            )}>
                <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] uppercase tracking-widest text-primary font-bold">{product.brand}</p>
                        <div className="flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-full">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-bold text-white">{product.rating}</span>
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white leading-tight mb-3 line-clamp-2">{product.name}</h3>

                    {/* Feature Highlights */}
                    {product.features && product.features.length > 0 ? (
                        <div className="mb-4">
                            <ul className="space-y-2">
                                {product.features.slice(0, 3).map((feat, i) => (
                                    <li key={i} className="text-xs text-white/80 flex items-start gap-2.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0 shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                                        <span className="line-clamp-2 leading-relaxed">{feat}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p className="text-sm text-white/60 line-clamp-4 leading-relaxed mb-4">
                            {product.description}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-white/5">
                    <Button
                        variant="outline"
                        className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white h-11 rounded-xl gap-2 transition-all hover:scale-[1.02]"
                        onClick={handleViewDetails}
                    >
                        <Eye className="w-4 h-4" />
                        Details
                    </Button>
                    <Button
                        className="bg-white text-black hover:bg-white/90 h-11 rounded-xl gap-2 border-0 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] transition-all hover:scale-[1.02]"
                        onClick={onAddToCart}
                    >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
