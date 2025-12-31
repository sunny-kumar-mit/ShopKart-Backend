import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-secondary">ABOUT</h3>
            <ul className="space-y-2 text-sm text-background/80">
              <li><Link to="/about" className="hover:text-secondary transition-colors">Contact Us</Link></li>
              <li><Link to="/about" className="hover:text-secondary transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-secondary transition-colors">Careers</Link></li>
              <li><Link to="/stories" className="hover:text-secondary transition-colors">ShopKart Stories</Link></li>
              <li><Link to="/press" className="hover:text-secondary transition-colors">Press</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-secondary">HELP</h3>
            <ul className="space-y-2 text-sm text-background/80">
              <li><Link to="/help" className="hover:text-secondary transition-colors font-semibold text-secondary">Help Center</Link></li>
              <li><Link to="/payments" className="hover:text-secondary transition-colors">Payments</Link></li>
              <li><Link to="/shipping" className="hover:text-secondary transition-colors">Shipping</Link></li>
              <li><Link to="/cancellation" className="hover:text-secondary transition-colors">Cancellation & Returns</Link></li>
              <li><Link to="/help" className="hover:text-secondary transition-colors">FAQ</Link></li>
              <li><Link to="/report" className="hover:text-secondary transition-colors">Report Infringement</Link></li>
            </ul>
          </div>

          {/* Policy */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-secondary">POLICY</h3>
            <ul className="space-y-2 text-sm text-background/80">
              <li><Link to="/return-policy" className="hover:text-secondary transition-colors">Return Policy</Link></li>
              <li><Link to="/terms" className="hover:text-secondary transition-colors">Terms Of Use</Link></li>
              <li><Link to="/security" className="hover:text-secondary transition-colors">Security</Link></li>
              <li><Link to="/privacy" className="hover:text-secondary transition-colors">Privacy</Link></li>
              <li><Link to="/sitemap" className="hover:text-secondary transition-colors">Sitemap</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-secondary">CONTACT</h3>
            <ul className="space-y-3 text-sm text-background/80">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-secondary" />
                <span>support@shopkart.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-secondary" />
                <span>1800-123-4567</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                <span>123 Commerce Street, Tech City, TC 12345</span>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex items-center gap-4 mt-6">
              <a href="#" className="text-background/60 hover:text-secondary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-background/60 hover:text-secondary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-background/60 hover:text-secondary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-background/60 hover:text-secondary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-secondary">ShopKart</span>
              <span className="text-sm text-background/60">© 2026 All rights reserved</span>
            </div>

            <div className="flex items-center gap-4 text-sm text-background/60">
              <span className="flex items-center gap-2">
                <img src="https://img.icons8.com/color/48/visa.png" alt="Visa" className="h-8" />
                <img src="https://img.icons8.com/color/48/mastercard.png" alt="Mastercard" className="h-8" />
                <img src="https://img.icons8.com/color/48/paypal.png" alt="PayPal" className="h-8" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
