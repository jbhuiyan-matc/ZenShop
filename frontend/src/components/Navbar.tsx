import { Link } from 'react-router-dom'
import { ShoppingCart, User, Menu } from 'lucide-react'
import { useState } from 'react'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-brand">zen<span className="text-neutral-900">SHOP</span></span>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8">
            <Link to="/products" className="text-neutral-900 hover:text-brand transition-colors">Products</Link>
            <Link to="/about" className="text-neutral-900 hover:text-brand transition-colors">About</Link>
            <Link to="/contact" className="text-neutral-900 hover:text-brand transition-colors">Contact</Link>
          </div>
          
          {/* User Icons */}
          <div className="flex items-center space-x-4">
            <Link to="/cart" className="text-neutral-900 hover:text-brand transition-colors relative">
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-accent text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
            </Link>
            
            <Link to="/login" className="text-neutral-900 hover:text-brand transition-colors">
              <User size={20} />
            </Link>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden text-neutral-900 focus:outline-none" 
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
              <Link to="/products" className="text-neutral-900 hover:text-brand transition-colors">Products</Link>
              <Link to="/about" className="text-neutral-900 hover:text-brand transition-colors">About</Link>
              <Link to="/contact" className="text-neutral-900 hover:text-brand transition-colors">Contact</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
