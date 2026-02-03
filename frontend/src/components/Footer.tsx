import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <div className="text-2xl font-bold mb-4">zen<span className="text-brand-light">SHOP</span></div>
            <p className="text-neutral-400">A secure e-commerce platform with elegant design and robust security measures.</p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-neutral-400 hover:text-brand-light transition-colors">Home</Link></li>
              <li><Link to="/products" className="text-neutral-400 hover:text-brand-light transition-colors">Products</Link></li>
              <li><Link to="/about" className="text-neutral-400 hover:text-brand-light transition-colors">About</Link></li>
              <li><Link to="/contact" className="text-neutral-400 hover:text-brand-light transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          {/* Account */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Account</h3>
            <ul className="space-y-2">
              <li><Link to="/login" className="text-neutral-400 hover:text-brand-light transition-colors">Login</Link></li>
              <li><Link to="/register" className="text-neutral-400 hover:text-brand-light transition-colors">Register</Link></li>
              <li><Link to="/cart" className="text-neutral-400 hover:text-brand-light transition-colors">Cart</Link></li>
              <li><Link to="/orders" className="text-neutral-400 hover:text-brand-light transition-colors">Orders</Link></li>
            </ul>
          </div>
          
          {/* Legal & Security */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal & Security</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-neutral-400 hover:text-brand-light transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-neutral-400 hover:text-brand-light transition-colors">Terms of Service</Link></li>
              <li><Link to="/security" className="text-neutral-400 hover:text-brand-light transition-colors">Security Details</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-400 text-sm">© {new Date().getFullYear()} ZenShop. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <span className="text-neutral-400 text-xs flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure Shopping
            </span>
            <span className="text-neutral-400 text-xs flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              OWASP Compliant
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
