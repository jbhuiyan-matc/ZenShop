import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, Menu, LogOut, Package } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../store/AppContext'

/**
 * Navbar Component
 * 
 * The main navigation header for the application.
 * Includes logo, desktop navigation links, and mobile menu toggle.
 * Displays user actions like Cart and Login.
 */
const Navbar = () => {
  // State to manage mobile menu visibility
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { cart, setCart, user, setUser, setToast } = useApp()
  const navigate = useNavigate()
  
  // Calculate total items in cart
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0)
  
  // Toggle mobile menu
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const handleLogout = () => {
    // Clear all storage
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    
    // Clear state
    setUser(null)
    setCart([])
    
    setToast({ message: 'Logged out successfully', type: 'success' })
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center group">
            <span className="text-2xl font-bold text-brand group-hover:text-brand-dark transition-colors">
              zen<span className="text-neutral-900">SHOP</span>
            </span>
          </Link>
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-8">
            <NavLink to="/products">Products</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </div>
          
          {/* User Actions (Cart, Profile, Mobile Toggle) */}
          <div className="flex items-center space-x-4">
            
            {/* Shopping Cart Icon */}
            <Link to="/cart" className="text-neutral-900 hover:text-brand transition-colors relative aria-label='Shopping Cart'">
              <ShoppingCart size={20} />
              {/* Cart Item Count Badge */}
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>
            
            {/* User Actions */}
            {user ? (
              <div className="flex items-center space-x-3">
                <Link to="/orders" className="text-neutral-900 hover:text-brand transition-colors" title="Orders">
                  <Package size={20} />
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-neutral-900 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-neutral-900 hover:text-brand transition-colors" aria-label='Login'>
                <User size={20} />
              </Link>
            )}
            
            {/* Mobile Menu Toggle Button */}
            <button 
              className="md:hidden text-neutral-900 focus:outline-none hover:text-brand transition-colors" 
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-in slide-in-from-top-2">
            <div className="flex flex-col space-y-3">
              <MobileNavLink to="/products" onClick={() => setIsMenuOpen(false)}>Products</MobileNavLink>
              <MobileNavLink to="/about" onClick={() => setIsMenuOpen(false)}>About</MobileNavLink>
              <MobileNavLink to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</MobileNavLink>
              {user && (
                <>
                  <MobileNavLink to="/orders" onClick={() => setIsMenuOpen(false)}>My Orders</MobileNavLink>
                  <button 
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="text-left text-neutral-900 hover:text-red-600 font-medium transition-colors px-2 py-1 hover:bg-gray-50 rounded"
                  >
                    Logout
                  </button>
                </>
              )}
              {!user && (
                <MobileNavLink to="/login" onClick={() => setIsMenuOpen(false)}>Login</MobileNavLink>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Helper component for consistent Desktop Nav Links
const NavLink = ({ to, children }) => (
  <Link 
    to={to} 
    className="text-neutral-900 hover:text-brand font-medium transition-colors"
  >
    {children}
  </Link>
)

// Helper component for consistent Mobile Nav Links
const MobileNavLink = ({ to, onClick, children }) => (
  <Link 
    to={to} 
    className="text-neutral-900 hover:text-brand font-medium transition-colors px-2 py-1 hover:bg-gray-50 rounded"
    onClick={onClick}
  >
    {children}
  </Link>
)

export default Navbar
