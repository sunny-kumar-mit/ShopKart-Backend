import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, ShoppingCart, Heart, User, Menu, X, ChevronDown,
  CreditCard, MapPin, TicketPercent, HelpCircle, LogOut, Package, UserCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { categories } from '@/data/mockData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import CategoryNavbar from './CategoryNavbar';
import SearchBar from './SearchBar';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownTimeoutRef = useState<{ current: NodeJS.Timeout | null }>({ current: null })[0];
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const cartItemCount = useCartStore((state) => state.getItemCount());
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-hero shadow-lg">
      <div className="container mx-auto">
        {/* Main Header */}
        <div className="flex items-center justify-between gap-4 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-primary-foreground tracking-tight">
                ShopKart
              </span>
              <span className="text-xs text-primary-foreground/80 italic flex items-center gap-1">
                Explore <span className="text-secondary">Plus</span>
                <span className="text-secondary">⊕</span>
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl px-8">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={() => {
                if (searchQuery.trim()) {
                  navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                }
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* User Menu */}
            <DropdownMenu open={isUserDropdownOpen} onOpenChange={setIsUserDropdownOpen}>
              <DropdownMenuTrigger
                asChild
                onMouseEnter={() => {
                  if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
                  setIsUserDropdownOpen(true);
                }}
                onMouseLeave={() => {
                  dropdownTimeoutRef.current = setTimeout(() => {
                    setIsUserDropdownOpen(false);
                  }, 200);
                }}
              >
                <Button
                  variant="ghost"
                  className="hidden md:flex items-center gap-2 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <User className="h-5 w-5" />
                  <span>{user ? `Hi, ${user.name.split(' ')[0]}` : 'Login'}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 bg-[#121216]/95 backdrop-blur-3xl border border-white/10 text-gray-200 shadow-2xl p-2 rounded-2xl"
                onMouseEnter={() => {
                  if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
                }}
                onMouseLeave={() => {
                  dropdownTimeoutRef.current = setTimeout(() => {
                    setIsUserDropdownOpen(false);
                  }, 200);
                }}
              >
                {!user ? (
                  <div className="p-1 space-y-1">
                    <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white rounded-xl cursor-pointer">
                      <Link to="/login" className="w-full font-medium flex items-center px-2 py-2">
                        Login
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white rounded-xl cursor-pointer">
                      <Link to="/register" className="w-full text-gray-400 flex items-center px-2 py-2">
                        Sign Up
                      </Link>
                    </DropdownMenuItem>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <DropdownMenuItem asChild className="bg-yellow-500/10 focus:bg-yellow-500/20 text-yellow-500 focus:text-yellow-400 border border-yellow-500/20 rounded-xl mb-2 cursor-pointer">
                      <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 font-semibold">
                        <UserCircle className="h-4 w-4" /> My Profile
                      </Link>
                    </DropdownMenuItem>

                    <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-gray-500 font-bold">Account</div>

                    <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white text-gray-300 rounded-xl cursor-pointer transition-colors">
                      <Link to="/orders" className="flex items-center gap-3 px-3 py-2">
                        <Package className="h-4 w-4 opacity-70" /> My Orders
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white text-gray-300 rounded-xl cursor-pointer transition-colors">
                      <Link to="/wishlist" className="flex items-center gap-3 px-3 py-2">
                        <Heart className="h-4 w-4 opacity-70" /> Wishlist
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white text-gray-300 rounded-xl cursor-pointer transition-colors">
                      <Link to="/cart" className="flex items-center gap-3 px-3 py-2">
                        <ShoppingCart className="h-4 w-4 opacity-70" /> Cart
                      </Link>
                    </DropdownMenuItem>

                    <div className="my-1 border-t border-white/10 mx-2" />

                    <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white text-gray-300 rounded-xl cursor-pointer transition-colors">
                      <Link to="/payments" className="flex items-center gap-3 px-3 py-2">
                        <CreditCard className="h-4 w-4 opacity-70" /> Payments
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white text-gray-300 rounded-xl cursor-pointer transition-colors">
                      <Link to="/addresses" className="flex items-center gap-3 px-3 py-2">
                        <MapPin className="h-4 w-4 opacity-70" /> Addresses
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white text-gray-300 rounded-xl cursor-pointer transition-colors">
                      <Link to="/coupons" className="flex items-center gap-3 px-3 py-2">
                        <TicketPercent className="h-4 w-4 opacity-70" /> Coupons & Offers
                      </Link>
                    </DropdownMenuItem>

                    <div className="my-1 border-t border-white/10 mx-2" />

                    <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white text-gray-300 rounded-xl cursor-pointer transition-colors">
                      <Link to="/help" className="flex items-center gap-3 px-3 py-2">
                        <HelpCircle className="h-4 w-4 opacity-70" /> Help Center
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => logout()}
                      className="text-rose-500 focus:text-rose-400 focus:bg-rose-500/10 rounded-xl cursor-pointer mt-1"
                    >
                      <div className="flex items-center gap-3 px-3 py-2 w-full font-medium">
                        <LogOut className="h-4 w-4" /> Logout
                      </div>
                    </DropdownMenuItem>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Wishlist */}
            <Link to="/wishlist">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-secondary text-secondary-foreground text-xs font-bold flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Cart */}
            <Link to="/cart">
              <Button
                variant="ghost"
                className="relative text-primary-foreground hover:bg-primary-foreground/10 flex items-center gap-2"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="hidden md:inline">Cart</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 md:relative md:top-0 md:right-0 h-5 w-5 md:h-auto md:w-auto md:px-2 rounded-full md:rounded-md bg-secondary text-secondary-foreground text-xs font-bold flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search for Products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-4 pr-10 rounded-lg bg-card text-foreground border-0"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
          </div>
        </div>
      </div>

      {/* Categories Bar */}
      <CategoryNavbar />

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-card border-t shadow-xl animate-slide-up">
          <nav className="container py-4 space-y-2">
            <Link
              to="/login"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <User className="h-5 w-5 text-primary" />
              <span>Login / Sign Up</span>
            </Link>

          </nav>
        </div>
      )}
    </header>
  );
}
