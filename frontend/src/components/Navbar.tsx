import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAtom } from 'jotai';
import { userAtom, cartCountAtom } from '../store/atoms';

/**
 * Navbar Component
 * 
 * Main navigation bar for the application.
 * Handles responsive design (mobile menu), user authentication state display,
 * and cart item count badge.
 */
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Jotai atoms for global state management
  const [user, setUser] = useAtom(userAtom);
  const [cartCount] = useAtom(cartCountAtom);
  
  const location = useLocation();

  const handleLogout = () => {
    // Clear local storage and global state
    localStorage.removeItem('token');
    setUser(null);
    setIsMenuOpen(false);
  };

  // Helper for active link styling
  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `text-gray-900 hover:text-blue-600 transition-colors ${isActive ? 'font-semibold text-blue-600' : ''}`;
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center group" aria-label="ZenShop Home">
            <span className="text-2xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
              zen<span className="text-gray-900">SHOP</span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8" role="navigation" aria-label="Main Navigation">
            <Link to="/products" className={getLinkClass('/products')}>Products</Link>
            <Link to="/about" className={getLinkClass('/about')}>About</Link>
            <Link to="/contact" className={getLinkClass('/contact')}>Contact</Link>
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className={getLinkClass('/admin')}>Admin</Link>
            )}
          </div>
          
          {/* User & Cart Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon with Badge */}
            <Link 
              to="/cart" 
              className="text-gray-900 hover:text-blue-600 transition-colors relative"
              aria-label={`Shopping Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold animate-pulse-once">
                  {cartCount}
                </span>
              )}
            </Link>
            
            {/* User Profile / Login */}
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 hidden sm:block font-medium">
                  {user.name || user.email}
                </span>
                <button 
                  onClick={handleLogout}
                  className="text-gray-900 hover:text-blue-600 transition-colors"
                  aria-label="Logout"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="text-gray-900 hover:text-blue-600 transition-colors"
                aria-label="Login"
              >
                <User size={20} />
              </Link>
            )}
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-gray-900 focus:outline-none p-2 rounded-md hover:bg-gray-100" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-label="Toggle mobile menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t bg-white" role="navigation" aria-label="Mobile Navigation">
            <div className="flex flex-col space-y-3 px-2">
              <Link 
                to="/products" 
                className="block py-2 px-4 rounded-lg hover:bg-gray-50 text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                to="/about" 
                className="block py-2 px-4 rounded-lg hover:bg-gray-50 text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="block py-2 px-4 rounded-lg hover:bg-gray-50 text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              {user?.role === 'ADMIN' && (
                <Link 
                  to="/admin" 
                  className="block py-2 px-4 rounded-lg hover:bg-gray-50 text-gray-900 font-medium text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
