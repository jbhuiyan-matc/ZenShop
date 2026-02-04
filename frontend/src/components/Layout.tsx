import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom, cartAtom } from '../store/atoms';
import { authAPI, cartAPI } from '../services/api';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Layout Component
 * 
 * The main application layout wrapper.
 * Enforces a consistent structure with a sticky header (Navbar),
 * flexible main content area, and a footer.
 */
const Layout = () => {
  const [user, setUser] = useAtom(userAtom);
  const [, setCart] = useAtom(cartAtom);

  // Effect: Restore User Session
  // Checks for a token in localStorage and fetches the user profile if found.
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.getProfile();
          setUser(response.data);
        } catch (error) {
          console.error('Failed to restore session:', error);
          // Note: Token removal on 401 is handled by the API interceptor
        }
      }
    };

    loadUser();
  }, [setUser]);

  // Effect: Load Cart
  // Fetches the user's cart whenever the user state changes (login/logout).
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        try {
          const response = await cartAPI.getCart();
          setCart(response.data);
        } catch (error) {
          console.error('Failed to load cart:', error);
        }
      } else {
        // Clear cart in state when user logs out
        setCart([]);
      }
    };

    loadCart();
  }, [user, setCart]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <Navbar />
      
      {/* Main Content Area */}
      {/* flex-grow ensures the footer stays at the bottom even with little content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Renders the child route's element */}
        <Outlet />
      </main>
      
      {/* Site Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
