import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { COUPONS } from '@/data/mockData';

export default function Cart() {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const subtotal = getTotal();
  const deliveryFee = subtotal > 499 ? 0 : 40;

  // Logic to calculate discount based on applied coupon
  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    return appliedCoupon.discount;
  };

  const discount = calculateDiscount();
  const total = subtotal - discount + deliveryFee;

  // Filter valid coupons based on minPurchase
  const availableCoupons = COUPONS.filter(c => subtotal >= (c.minPurchase || 0));

  const handleApplyCoupon = (codeOverride?: string) => {
    const codeToApply = codeOverride || couponCode;

    // Find the coupon in our list
    const coupon = COUPONS.find(c => c.code.toUpperCase() === codeToApply.toUpperCase());

    if (!coupon) {
      if (codeToApply.toUpperCase() === 'SAVE10') {
        // Keep legacy support for SAVE10 just in case
        setAppliedCoupon({ code: 'SAVE10', discount: subtotal * 0.1 });
        toast.success('Coupon applied! 10% discount added.');
        return;
      }
      toast.error('Invalid coupon code');
      return;
    }

    // Check minimum purchase
    if (subtotal < (coupon.minPurchase || 0)) {
      toast.error(`Minimum purchase of ₹${coupon.minPurchase} required for this coupon.`);
      return;
    }

    // Check expiry (simple check)
    if (new Date(coupon.expiry) < new Date()) {
      toast.error('This coupon has expired.');
      return;
    }

    // Calculate discount
    let calculatedDiscount = 0;
    if (coupon.discountType === 'flat') {
      calculatedDiscount = coupon.discountValue || 0;
    } else if (coupon.discountType === 'percentage') {
      calculatedDiscount = (subtotal * (coupon.discountValue || 0)) / 100;
      if (coupon.maxDiscount) {
        calculatedDiscount = Math.min(calculatedDiscount, coupon.maxDiscount);
      }
    }

    setAppliedCoupon({ code: coupon.code, discount: calculatedDiscount });
    setCouponCode(coupon.code);
    toast.success(`Coupon ${coupon.code} applied! You saved ${formatPrice(calculatedDiscount)}`);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.info('Coupon removed');
  };

  const handleRemoveItem = (productId: string, productName: string) => {
    removeItem(productId);
    toast.info(`${productName} removed from cart`);
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link to="/">
              <Button size="lg">
                Continue Shopping
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
        <h1 className="text-3xl font-bold text-foreground mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="bg-card rounded-xl border p-4 flex gap-4"
              >
                {/* Product Image */}
                <Link to={`/product/${product.id}`} className="shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg"
                  />
                </Link>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-semibold text-card-foreground hover:text-primary transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">{product.brand}</p>

                  {/* Price */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-bold text-card-foreground">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                    {product.discount && (
                      <span className="text-sm text-success font-semibold">
                        {product.discount}% off
                      </span>
                    )}
                  </div>

                  {/* Quantity & Remove */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border rounded-lg">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-10 text-center font-semibold">{quantity}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveItem(product.id, product.name)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* Clear Cart */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => {
                  clearCart();
                  toast.info('Cart cleared');
                }}
              >
                Clear Cart
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border p-6 sticky top-24">
              <h2 className="text-xl font-bold text-card-foreground mb-6">Order Summary</h2>

              {/* Coupon */}
              <div className="mb-6">
                <label className="text-sm font-medium text-card-foreground mb-2 block">
                  Have a coupon?
                </label>
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Enter code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button variant="outline" onClick={() => handleApplyCoupon()}>
                      Apply
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-bold text-green-700">{appliedCoupon.code}</p>
                        <p className="text-xs text-green-600">Saved {formatPrice(appliedCoupon.discount)}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={removeCoupon} className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Available Coupons List */}
                {!appliedCoupon && availableCoupons.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Available Coupons</p>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                      {availableCoupons.map((coupon) => (
                        <div
                          key={coupon.id}
                          className="border border-dashed border-primary/30 bg-primary/5 rounded-lg p-3 hover:bg-primary/10 transition-colors cursor-pointer group"
                          onClick={() => handleApplyCoupon(coupon.code)}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-primary text-sm">{coupon.code}</span>
                            <span className="text-xs font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                              {coupon.discountType === 'flat' ? `Flat ${formatPrice(coupon.discountValue || 0)}` : `${coupon.discountValue}% OFF`}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{coupon.description}</p>
                          <div className="text-[10px] text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            Click to apply
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 text-sm border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Coupon Discount</span>
                    <span className="font-medium">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium">
                    {deliveryFee === 0 ? (
                      <span className="text-success">FREE</span>
                    ) : (
                      formatPrice(deliveryFee)
                    )}
                  </span>
                </div>
                {deliveryFee > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Add {formatPrice(500 - subtotal)} more for free delivery
                  </p>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center border-t mt-4 pt-4">
                <span className="text-lg font-bold text-card-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
              </div>

              {/* Checkout Button */}
              <Link to="/checkout">
                <Button variant="hero" size="xl" className="w-full mt-6">
                  Proceed to Checkout
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>

              {/* Continue Shopping */}
              <Link to="/" className="block mt-4">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
