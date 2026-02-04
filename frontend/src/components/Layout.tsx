import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom, cartAtom } from '../store/atoms';
import { authAPI, cartAPI } from '../services/api';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  const [user, setUser] = useAtom(userAtom);
  const [, setCart] = useAtom(cartAtom);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.getProfile();
          setUser(response.data);
        } catch (error) {
          console.error('Failed to load user profile:', error);
        }
      }
    };

    loadUser();
  }, [setUser]);

  // Load cart when user changes
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        try {
          const response = await cartAPI.getCart();
          setCart(response.data);
        } catch {
          // User might not be logged in or other error
        }
      } else {
        setCart([]);
      }
    };

    loadCart();
  }, [user, setCart]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
