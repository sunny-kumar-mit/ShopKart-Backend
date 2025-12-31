import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { products } from '@/data/mockData';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { toast } from 'sonner';
import {
  Star,
  Heart,
  ShoppingCart,
  Truck,
  Shield,
  RefreshCw,
  Minus,
  Plus,
  ChevronRight,
  Share2,
  Check,
  ArrowLeft,
} from 'lucide-react';
import { ProductGrid } from '@/components/products/ProductGrid';
import { SingleProductMarquee } from '@/components/products/SingleProductMarquee';
import { cn } from '@/lib/utils';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Scroll to top when product changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const product = products.find((p) => p.id === id);
  const addToCart = useCartStore((state) => state.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist.</p>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const isWishlisted = isInWishlist(product.id);
  const relatedProducts = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 5);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${quantity} × ${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    window.location.href = '/cart';
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
      toast.info('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist!');
    }
  };

  const productImages = product.images || [product.image, product.image, product.image];

  return (
    <Layout>
      {/* Breadcrumb & Back Navigation */}
      <div className="bg-muted border-b">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 -ml-2 hover:bg-background/50 hover:text-primary rounded-full transition-colors"
            onClick={() => navigate(-1)}
            title="Go Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="h-4 w-px bg-border" />
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to={`/category/${product.category.toLowerCase()}`} className="hover:text-primary transition-colors">
              {product.category}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-card rounded-2xl overflow-hidden border">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    "w-20 h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0",
                    selectedImage === index
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-transparent hover:border-muted-foreground/30"
                  )}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Header Section */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-primary font-semibold uppercase tracking-wide mb-2">
                  {product.brand}
                </p>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-success text-success-foreground text-sm font-bold px-3 py-1 rounded-lg">
                    <span>{product.rating}</span>
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                  <span className="text-muted-foreground">
                    {product.reviewCount.toLocaleString()} ratings & reviews
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="bg-muted/50 p-6 rounded-2xl border">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-4xl md:text-5xl font-bold text-foreground">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <>
                      <span className="text-xl text-muted-foreground line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                      <span className="text-lg text-success font-bold bg-success/10 px-2 py-0.5 rounded">
                        {product.discount}% OFF
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Inclusive of all taxes
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {/* Features Highlights */}
            {product.features && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Feature Highlights</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity & Actions */}
            <div className="space-y-6 pt-6 border-t">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-foreground">Quantity:</span>
                <div className="flex items-center border rounded-lg bg-background">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= product.stockQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.stockQuantity > 0
                    ? `${product.stockQuantity} items available`
                    : <span className="text-destructive font-medium">Out of Stock</span>
                  }
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="cart"
                  size="xl"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </Button>
                <Button
                  variant="accent"
                  size="xl"
                  className="flex-1"
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                >
                  Buy Now
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  className={cn("flex-1", isWishlisted && "text-deal border-deal")}
                  onClick={handleWishlistToggle}
                >
                  <Heart className={cn("h-5 w-5 mr-2", isWishlisted && "fill-deal")} />
                  {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Services */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex flex-col items-center text-center p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Truck className="h-8 w-8 text-primary mb-2" />
                <span className="text-sm font-medium">Free Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <RefreshCw className="h-8 w-8 text-primary mb-2" />
                <span className="text-sm font-medium">30 Days Return</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Shield className="h-8 w-8 text-primary mb-2" />
                <span className="text-sm font-medium">Genuine Product</span>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications Section */}
        {product.specifications && (
          <div className="mt-16 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Product Specifications</h2>
            <div className="bg-card rounded-xl border overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                {Object.entries(product.specifications).map(([key, value], idx) => (
                  <div key={key} className={cn(
                    "flex flex-col p-4",
                    idx % 2 === 0 ? "bg-muted/30" : "bg-background"
                  )}>
                    <span className="text-sm text-muted-foreground font-medium mb-1">{key}</span>
                    <span className="text-foreground font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reviews Section (Mock) */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Customer Reviews</h2>
            <Button variant="outline">Write a Review</Button>
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card p-6 rounded-xl border">
                <div className="flex items-center gap-4 mb-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {String.fromCharCode(64 + i)}
                  </div>
                  <div>
                    <h4 className="font-semibold">User {i}</h4>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <span className="ml-auto text-sm text-muted-foreground">2 days ago</span>
                </div>
                <p className="text-muted-foreground">
                  "Absolutely loving this product! The quality is top-notch and it exceeds my expectations. Would definitely recommend."
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <SingleProductMarquee
              products={relatedProducts}
              title="Similar Products"
              direction="left"
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
