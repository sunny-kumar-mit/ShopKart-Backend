import { Link, useNavigate } from 'react-router-dom';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ProductPopCart } from './ProductPopCart';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const isWishlisted = isInWishlist(product.id);
  const navigate = useNavigate();

  // Premium Pop-Cart Logic
  const [showPopup, setShowPopup] = useState(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [popupPosition, setPopupPosition] = useState<'left' | 'right' | 'center'>('center');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseEnter = () => {
    if (isMobile) return;

    // Calculate smart position
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const popupWidth = 650; // Width of our new landscape card
      const cardWidth = rect.width;

      // Default center overflow amount
      const overflowAmount = (popupWidth - cardWidth) / 2;

      // Check if centering would overflow left or right
      if (rect.left < overflowAmount) {
        setPopupPosition('left'); // Align left edge with card left
      } else if ((viewportWidth - rect.right) < overflowAmount) {
        setPopupPosition('right'); // Align right edge with card right
      } else {
        setPopupPosition('center'); // Center as normal
      }
    }

    hoverTimerRef.current = setTimeout(() => {
      setShowPopup(true);
    }, 200); // 200ms delay for premium feel
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setShowPopup(false);
  };

  // Mobile: Feature is OFF as requested. Standard link behavior applies.
  const handleMobileTap = (e: React.MouseEvent) => {
    // No popup on mobile
  };

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
    <div
      ref={cardRef}
      className={cn(
        "relative transition-all duration-300",
        showPopup ? "z-40" : "z-10" // Elevate z-index to 40 (below Header's 50) but above peers
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        to={`/product/${product.id}`}
        onClick={handleMobileTap}
      >
        <div
          className={cn(
            "group relative bg-card rounded-xl border overflow-hidden transition-all duration-500",
            // Only apply standard hover effects if popup is NOT showing to avoid conflict
            !showPopup && "hover:shadow-xl hover:-translate-y-1",
            className
          )}
        >
          {/* Discount Badge */}
          {product.discount && product.discount > 0 && (
            <div className="absolute top-3 left-3 z-10">
              <span className="bg-gradient-deal text-deal-foreground text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                {product.discount}% OFF
              </span>
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-card/80 backdrop-blur-md shadow-lg transition-all hover:scale-110 active:scale-90"
          >
            <Heart
              className={cn(
                "h-5 w-5 transition-colors",
                isWishlisted ? "fill-deal text-deal" : "text-muted-foreground"
              )}
            />
          </button>

          {/* Image */}
          <div className="aspect-square overflow-hidden bg-muted">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          {/* Content */}
          <div className="p-4 space-y-2">
            {/* Brand */}
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              {product.brand}
            </p>

            {/* Name */}
            <h3 className="font-semibold text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-success text-success-foreground text-xs font-bold px-2 py-0.5 rounded">
                <span>{product.rating}</span>
                <Star className="h-3 w-3 fill-current" />
              </div>
              <span className="text-xs text-muted-foreground">
                ({product.reviewCount.toLocaleString()})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-bold text-card-foreground">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="text-sm text-success font-semibold">
                    {product.discount}% off
                  </span>
                </>
              )}
            </div>

            {/* Add to Cart Button (Default) */}
            <Button
              variant="cart"
              size="sm"
              className="w-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </div>
      </Link>

      {/* Premium Pop-Cart Overlay */}
      <AnimatePresence>
        {showPopup && !isMobile && (
          <ProductPopCart
            product={product}
            onAddToCart={handleAddToCart}
            isMobile={false}
            position={popupPosition}
            onClose={() => setShowPopup(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
