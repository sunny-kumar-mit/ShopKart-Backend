import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { Star, ShoppingCart, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

interface DealsSectionProps {
  products: Product[];
}

export function DealsSection({ products }: DealsSectionProps) {
  const addToCart = useCartStore((state) => state.addItem);
  const [timeLeft, setTimeLeft] = useState(19425); // 05:23:45 in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 19425)); // Loop or stop
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return {
      h: h.toString().padStart(2, '0'),
      m: m.toString().padStart(2, '0'),
      s: s.toString().padStart(2, '0'),
    };
  };

  const { h, m, s } = formatTime(timeLeft);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-deal">
            <Zap className="h-6 w-6 text-deal-foreground" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Flash Deals
            </h2>
            <p className="text-sm text-muted-foreground">
              Limited time offers - Grab now!
            </p>
          </div>
        </div>
        <Link to="/deals">
          <Button variant="outline">View All</Button>
        </Link>
      </div>

      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="snap-start"
            >
              <div className="w-[220px] md:w-[260px] bg-card rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
                {/* Discount Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="bg-gradient-deal text-deal-foreground text-sm font-bold px-3 py-1 rounded-md flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {product.discount}% OFF
                  </span>
                </div>

                {/* Image */}
                <div className="aspect-square overflow-hidden bg-muted relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Timer Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/80 to-transparent p-3">
                    <div className="flex items-center justify-center gap-2 text-background text-sm font-mono">
                      <span className="bg-deal px-2 py-1 rounded">{h}</span>
                      <span>:</span>
                      <span className="bg-deal px-2 py-1 rounded">{m}</span>
                      <span>:</span>
                      <span className="bg-deal px-2 py-1 rounded">{s}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <p className="text-xs text-muted-foreground font-medium uppercase">
                    {product.brand}
                  </p>
                  <h3 className="font-semibold text-card-foreground line-clamp-1">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-success text-success-foreground text-xs font-bold px-2 py-0.5 rounded">
                      <span>{product.rating}</span>
                      <Star className="h-3 w-3 fill-current" />
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-card-foreground">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  <Button
                    variant="deal"
                    size="sm"
                    className="w-full"
                    onClick={(e) => handleAddToCart(e, product)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Buy Now
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
