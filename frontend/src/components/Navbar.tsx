import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAtom } from 'jotai';
import { userAtom, cartCountAtom } from '../store/atoms';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useAtom(userAtom);
  const [cartCount] = useAtom(cartCountAtom);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">zen<span className="text-gray-900">SHOP</span></span>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8">
            <Link to="/products" className="text-gray-900 hover:text-blue-600 transition-colors">Products</Link>
            <Link to="/about" className="text-gray-900 hover:text-blue-600 transition-colors">About</Link>
            <Link to="/contact" className="text-gray-900 hover:text-blue-600 transition-colors">Contact</Link>
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className="text-gray-900 hover:text-blue-600 transition-colors">Admin</Link>
            )}
          </div>
          
          {/* User Icons */}
          <div className="flex items-center space-x-4">
            <Link to="/cart" className="text-gray-900 hover:text-blue-600 transition-colors relative">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cartCount}
                </span>
              )}
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 hidden sm:block">{user.name || user.email}</span>
                <button 
                  onClick={handleLogout}
                  className="text-gray-900 hover:text-blue-600 transition-colors"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-gray-900 hover:text-blue-600 transition-colors">
                <User size={20} />
              </Link>
            )}
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden text-gray-900 focus:outline-none" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-3">
              <Link to="/products" className="text-gray-900 hover:text-blue-600 transition-colors">Products</Link>
              <Link to="/about" className="text-gray-900 hover:text-blue-600 transition-colors">About</Link>
              <Link to="/contact" className="text-gray-900 hover:text-blue-600 transition-colors">Contact</Link>
              {user?.role === 'ADMIN' && (
                <Link to="/admin" className="text-gray-900 hover:text-blue-600 transition-colors">Admin</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
