import { Link } from 'react-router-dom';
import { ShieldCheck, Lock } from 'lucide-react';

/**
 * Footer Component
 * 
 * Displays site navigation links, account links, legal information,
 * and security badges.
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-white py-10 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="text-2xl font-bold block" aria-label="ZenShop Home">
              zen<span className="text-blue-500">SHOP</span>
            </Link>
            <p className="text-neutral-400 text-sm leading-relaxed">
              A secure e-commerce platform designed with modern security principles 
              to ensure your shopping experience is safe and seamless.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-100">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-neutral-400 hover:text-blue-400 transition-colors">Home</Link></li>
              <li><Link to="/products" className="text-neutral-400 hover:text-blue-400 transition-colors">Products</Link></li>
              <li><Link to="/about" className="text-neutral-400 hover:text-blue-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-neutral-400 hover:text-blue-400 transition-colors">Contact Support</Link></li>
            </ul>
          </div>
          
          {/* Account */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-100">My Account</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="text-neutral-400 hover:text-blue-400 transition-colors">Login</Link></li>
              <li><Link to="/register" className="text-neutral-400 hover:text-blue-400 transition-colors">Register</Link></li>
              <li><Link to="/cart" className="text-neutral-400 hover:text-blue-400 transition-colors">Shopping Cart</Link></li>
              <li><Link to="/orders" className="text-neutral-400 hover:text-blue-400 transition-colors">Order History</Link></li>
            </ul>
          </div>
          
          {/* Legal & Security */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-100">Legal & Security</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="text-neutral-400 hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-neutral-400 hover:text-blue-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/security" className="text-neutral-400 hover:text-blue-400 transition-colors">Security Details</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-sm">
          <p className="text-neutral-500">
            &copy; {currentYear} ZenShop. All rights reserved.
          </p>
          
          {/* Security Badges */}
          <div className="flex space-x-6 mt-4 md:mt-0">
            <div className="flex items-center text-neutral-400" title="Secure Shopping">
              <Lock size={16} className="mr-2 text-green-500" />
              <span>Secure Shopping</span>
            </div>
            <div className="flex items-center text-neutral-400" title="OWASP Compliant">
              <ShieldCheck size={16} className="mr-2 text-blue-500" />
              <span>OWASP Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
