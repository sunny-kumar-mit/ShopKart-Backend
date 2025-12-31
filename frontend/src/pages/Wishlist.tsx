import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import { Heart, ShoppingCart, Trash2, ArrowRight, Star } from 'lucide-react';

export default function Wishlist() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addItem);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = (product: typeof items[0]) => {
    addToCart(product);
    removeItem(product.id);
    toast.success(`${product.name} moved to cart!`);
  };

  const handleRemoveItem = (productId: string, productName: string) => {
    removeItem(productId);
    toast.info(`${productName} removed from wishlist`);
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">Your wishlist is empty</h1>
            <p className="text-muted-foreground mb-8">
              Save items you love by clicking the heart icon on products.
            </p>
            <Link to="/">
              <Button size="lg">
                Start Shopping
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            My Wishlist ({items.length})
          </h1>
          <Button
            variant="outline"
            className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => {
              clearWishlist();
              toast.info('Wishlist cleared');
            }}
          >
            Clear All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((product) => (
            <div
              key={product.id}
              className="bg-card rounded-xl border overflow-hidden group"
            >
              {/* Image */}
              <Link to={`/product/${product.id}`}>
                <div className="aspect-square overflow-hidden bg-muted relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {product.discount && product.discount > 0 && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-gradient-deal text-deal-foreground text-xs font-bold px-2 py-1 rounded-md">
                        {product.discount}% OFF
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Content */}
              <div className="p-4 space-y-3">
                <p className="text-xs text-muted-foreground font-medium uppercase">
                  {product.brand}
                </p>
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-semibold text-card-foreground line-clamp-2 hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-success text-success-foreground text-xs font-bold px-2 py-0.5 rounded">
                    <span>{product.rating}</span>
                    <Star className="h-3 w-3 fill-current" />
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-card-foreground">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="cart"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Move to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleRemoveItem(product.id, product.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
