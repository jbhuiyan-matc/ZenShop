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

  // Load user and cart on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.getProfile();
          setUser(response.data);
        } catch {
          localStorage.removeItem('token');
        }
      }
    };

    const loadCart = async () => {
      if (user) {
        try {
          const response = await cartAPI.getCart();
          setCart(response.data);
        } catch {
          // User might not be logged in
        }
      }
    };

    loadUser();
    loadCart();
  }, [setUser, setCart, user]);

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
