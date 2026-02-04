import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from './components/Layout';

// Lazy-loaded page components for code-splitting
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

// Placeholder components for pages not yet created
const ProductDetail = () => <div className="p-8 text-center">Product Detail Page - Coming Soon</div>;
const Cart = () => <div className="p-8 text-center">Cart Page - Coming Soon</div>;
const Checkout = () => <div className="p-8 text-center">Checkout Page - Coming Soon</div>;
const NotFound = () => <div className="p-8 text-center text-2xl">404 - Page Not Found</div>;

function App() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
