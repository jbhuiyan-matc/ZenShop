import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Layout from './components/Layout'

// =========================================
// Lazy Loaded Components
// =========================================
// We use lazy loading to split the code into smaller bundles,
// improving initial load time for the application.

const Home = lazy(() => import('./pages/Home'))
const ProductListing = lazy(() => import('./pages/ProductListing'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const NotFound = lazy(() => import('./pages/NotFound'))

// =========================================
// Main App Component
// =========================================

function App() {
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
          <Route path="products" element={<ProductListing />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          
          {/* Auth Routes */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          
          {/* Checkout Flow */}
          <Route path="checkout" element={<Checkout />} />
          
          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
          
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
