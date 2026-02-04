import { Link } from 'react-router-dom'
import { ReactNode } from 'react'

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
          
          {/* Legal & Security */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Security</h3>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><FooterLink to="/privacy">Privacy Policy</FooterLink></li>
              <li><FooterLink to="/terms">Terms of Service</FooterLink></li>
              <li><FooterLink to="/security">Security Advisories</FooterLink></li>
              <li><FooterLink to="/compliance">Compliance</FooterLink></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar: Copyright & Badges */}
        <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-neutral-500 text-xs">
            &copy; {currentYear} ZenShop. All rights reserved.
          </p>
          
          <div className="flex items-center space-x-6">
            <SecurityBadge label="SSL Secured" />
            <SecurityBadge label="PCI DSS Compliant" />
            <SecurityBadge label="OWASP Top 10" />
          </div>
        </div>
      </div>
    </footer>
  );
};

// Helper: Footer Link
const FooterLink = ({ to, children }: { to: string, children: ReactNode }) => (
  <Link to={to} className="hover:text-brand-light transition-colors">
    {children}
  </Link>
)

// Helper: Security Badge (Simple Text/Icon placeholder)
const SecurityBadge = ({ label }: { label: string }) => (
  <span className="flex items-center text-neutral-500 text-xs font-medium border border-neutral-700 rounded px-2 py-1">
    <svg className="w-3 h-3 mr-1.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
    {label}
  </span>
)

export default Footer
