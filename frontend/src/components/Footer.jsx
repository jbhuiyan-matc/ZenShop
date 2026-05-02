import { Link } from 'react-router-dom'

/**
 * Footer Component
 * 
 * Displays the site footer with navigation links, contact info,
 * and security compliance badges.
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-white py-12 border-t border-neutral-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand & Description */}
          <div className="col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-bold text-white">zen<span className="text-brand-light">SHOP</span></span>
            </Link>
            <p className="text-neutral-400 text-sm leading-relaxed">
              A secure e-commerce platform built with a focus on data privacy, 
              secure transactions, and modern web standards.
            </p>
          </div>
          
          {/* Shop Navigation */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Shop</h3>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><FooterLink to="/products">All Products</FooterLink></li>
              <li><FooterLink to="/products?category=Electronics">Electronics</FooterLink></li>
              <li><FooterLink to="/products?category=Clothing">Clothing</FooterLink></li>
              <li><FooterLink to="/products?category=Home%20%26%20Garden">Home & Garden</FooterLink></li>
              <li><FooterLink to="/products?category=Sports%20%26%20Outdoors">Sports & Outdoors</FooterLink></li>
            </ul>
          </div>
          
          {/* Customer Support */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><FooterLink to="/contact">Contact Us</FooterLink></li>
              <li><FooterLink to="/faq">FAQs</FooterLink></li>
              <li><FooterLink to="/shipping">Shipping Info</FooterLink></li>
              <li><FooterLink to="/returns">Returns Policy</FooterLink></li>
            </ul>
          </div>
          
          {/* Policies */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Policies</h3>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><FooterLink to="/privacy">Privacy Policy</FooterLink></li>
              <li><FooterLink to="/terms">Terms of Service</FooterLink></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar: Copyright */}
        <div className="border-t border-neutral-800 pt-8 flex justify-center items-center">
          <p className="text-neutral-500 text-xs">
            &copy; {currentYear} ZenShop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

// Helper: Footer Link
const FooterLink = ({ to, children }) => (
  <Link to={to} className="hover:text-brand-light transition-colors">
    {children}
  </Link>
)

export default Footer
