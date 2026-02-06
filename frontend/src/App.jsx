import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { useApp } from './store/useApp';
import { authAPI, cartAPI } from './services/api';
import Layout from './components/Layout';

// =========================================
// Lazy Loaded Components
// =========================================
// We use lazy loading to split the code into smaller bundles,
// improving initial load time for the application.

const Home = lazy(() => import('./pages/Home'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const Security = lazy(() => import('./pages/Security'))
const FAQ = lazy(() => import('./pages/FAQ'))
const Shipping = lazy(() => import('./pages/Shipping'))
const Returns = lazy(() => import('./pages/Returns'))
const Compliance = lazy(() => import('./pages/Compliance'))
const Orders = lazy(() => import('./pages/Orders'))
const Admin = lazy(() => import('./pages/Admin'))
const NotFound = lazy(() => import('./pages/NotFound'))

// =========================================
// Main App Component
// =========================================

function App() {
  const { setUser, setCart, setIsAuthRestoring } = useApp();

  useEffect(() => {
    const initAuth = async () => {
      // Check both storage mechanisms
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (token) {
        try {
          // Fetch user profile
          const userData = await authAPI.getProfile();
          setUser(userData);
          
          // Fetch cart
          try {
            const cartData = await cartAPI.getCart();
            setCart(cartData);
          } catch (cartError) {
            console.error('Failed to fetch cart', cartError);
          }
        } catch (error) {
          console.error('Session restoration failed:', error);
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          setUser(null);
          setCart([]);
        }
      }
      setIsAuthRestoring(false);
    };

    initAuth();
  }, [setUser, setCart, setIsAuthRestoring]);

  return (
    // Suspense handles the loading state while lazy components are being fetched
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-light border-t-brand rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-gray-500 font-medium">Loading ZenShop...</p>
        </div>
      </div>
    }>
      <Routes>
        {/* Main Layout Wrapper */}
        <Route path="/" element={<Layout />}>
          
          {/* Public Routes */}
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          
          {/* Support Routes */}
          <Route path="faq" element={<FAQ />} />
          <Route path="shipping" element={<Shipping />} />
          <Route path="returns" element={<Returns />} />
          
          {/* Auth Routes */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          
          {/* Protected Routes (TODO: Add AuthGuard) */}
          <Route path="orders" element={<Orders />} />
          <Route path="admin" element={<Admin />} />
          
          {/* Checkout Flow */}
          <Route path="checkout" element={<Checkout />} />
          
          {/* Legal & Security */}
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="security" element={<Security />} />
          <Route path="compliance" element={<Compliance />} />
          
          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
          
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
