import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Eye } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MarqueeProductCardProps {
    product: Product;
    className?: string;
}

export function MarqueeProductCard({ product, className }: MarqueeProductCardProps) {
    const addToCart = useCartStore((state) => state.addItem);
    const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
    const isWishlisted = isInWishlist(product.id);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
        toast.success(`${product.name} added to cart!`);
    };

    const handleWishlistToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isWishlisted) {
            removeFromWishlist(product.id);
            toast.info('Removed from wishlist');
        } else {
            addToWishlist(product);
            toast.success('Added to wishlist!');
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    return (
        <Link to={`/product/${product.id}`} className="block h-full group">
            <div className={cn(
                "relative h-[380px] w-full rounded-2xl overflow-hidden border border-white/10 bg-card shadow-sm transition-all duration-500",
                className
            )}>
                {/* Background Image - Full Size */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                </div>

                {/* Top Badges */}
                <div className="absolute top-4 left-4 z-20 flex gap-2">
                    {product.discount && product.discount > 0 && (
                        <span className="bg-white/90 backdrop-blur text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                            {product.discount}% OFF
                        </span>
                    )}
                </div>

                {/* Wishlist Button */}
                <button
                    onClick={handleWishlistToggle}
                    className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/20 backdrop-blur-md border border-white/20 text-white transition-all hover:bg-white hover:text-red-500"
                >
                    <Heart className={cn("h-5 w-5", isWishlisted && "fill-current text-red-500")} />
                </button>

                {/* Overlay Content - "Blurish" Glassmorphism Card */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-10 translate-y-[60px] group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    {/* Glass Card */}
                    <div className="relative overflow-hidden rounded-xl bg-black/30 backdrop-blur-xl border border-white/20 p-4 shadow-xl">

                        {/* Brand */}
                        <p className="text-xs font-medium text-white/80 uppercase tracking-wider mb-1">
                            {product.brand}
                        </p>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-white leading-tight mb-2 line-clamp-1">
                            {product.name}
                        </h3>

                        {/* Rating & Count */}
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-1 bg-white/20 backdrop-blur px-2 py-0.5 rounded text-xs font-bold text-white">
                                {product.rating} <Star className="h-3 w-3 fill-current" />
                            </div>
                            <span className="text-xs text-white/60">({product.reviewCount}) reviews</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-end gap-2 mb-4">
                            <span className="text-xl font-bold text-white">
                                {formatPrice(product.price)}
                            </span>
                            {product.originalPrice && (
                                <span className="text-sm text-white/50 line-through mb-1">
                                    {formatPrice(product.originalPrice)}
                                </span>
                            )}
                        </div>

                        {/* Action Buttons - Reveal on Hover part */}
                        <div className="grid grid-cols-2 gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                            <Button
                                size="sm"
                                variant="secondary"
                                className="w-full bg-white/90 text-black hover:bg-white border-none"
                            >
                                <Eye className="h-4 w-4 mr-2" /> View
                            </Button>
                            <Button
                                size="sm"
                                className="w-full bg-white text-black hover:bg-white/90 border-none"
                                onClick={handleAddToCart}
                            >
                                <ShoppingCart className="h-4 w-4 mr-2" /> Add
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Full gradient overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none z-0" />
            </div>
        </Link>
    );
}
