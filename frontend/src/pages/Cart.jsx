import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useApp } from '../store/useApp';
import { cartAPI } from '../services/api';
import Button from '../components/ui/Button';

export default function Cart() {
  const { cart, setCart, user, setToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(null);
  const navigate = useNavigate();

  // If not logged in, prompt to login
  if (!user) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 animate-in fade-in">
        <ShoppingBag className="mx-auto h-16 w-16 text-gray-300 mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your cart</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          You need an account to add items to your cart and checkout.
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="primary" onClick={() => navigate('/login', { state: { from: { pathname: '/cart' } } })}>
            Sign In
          </Button>
          <Button variant="secondary" to="/register">
            Create Account
          </Button>
        </div>
      </div>
    );
  }

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(itemId);
    try {
      const updatedItem = await cartAPI.updateItem(itemId, newQuantity);
      setCart(cart.map(item => item.id === itemId ? updatedItem : item));
    } catch (error) {
      console.error('Failed to update quantity:', error);
      setToast({ message: error.response?.data?.error || 'Failed to update quantity', type: 'error' });
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    setUpdating(itemId);
    try {
      await cartAPI.removeItem(itemId);
      setCart(cart.filter(item => item.id !== itemId));
      setToast({ message: 'Item removed from cart', type: 'success' });
    } catch (error) {
      console.error('Failed to remove item:', error);
      setToast({ message: 'Failed to remove item', type: 'error' });
    } finally {
      setUpdating(null);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;
    
    setLoading(true);
    try {
      await cartAPI.clearCart();
      setCart([]);
      setToast({ message: 'Cart cleared successfully', type: 'success' });
    } catch (error) {
      console.error('Failed to clear cart:', error);
      setToast({ message: 'Failed to clear cart', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const cartTotal = cart.reduce((total, item) => {
    return total + (Number(item.product.price) * item.quantity);
  }, 0);

  if (cart.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 animate-in fade-in">
        <div className="bg-gray-50 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Looks like you haven&apos;t added anything to your cart yet. Browse our products to find something you&apos;ll love.
        </p>
        <Button variant="primary" to="/products" className="inline-flex items-center">
          Start Shopping
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Shopping Cart</h1>
        <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleClearCart} disabled={loading}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Cart
        </Button>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden mb-8">
        <ul className="divide-y divide-gray-100">
          {cart.map((item) => (
            <li key={item.id} className="flex py-6 px-4 sm:px-6 hover:bg-gray-50/50 transition-colors">
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                {item.product.imageUrl ? (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="h-full w-full object-cover object-center"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/100x100?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                    No image
                  </div>
                )}
              </div>

              <div className="ml-4 flex flex-1 flex-col">
                <div>
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <h3 className="line-clamp-1 mr-4">
                      <Link to={`/products/${item.product.id}`} className="hover:text-brand transition-colors">
                        {item.product.name}
                      </Link>
                    </h3>
                    <p className="ml-4 whitespace-nowrap text-lg font-bold">${Number(item.product.price).toFixed(2)}</p>
                  </div>
                  {item.product.stock <= 5 && (
                    <p className="mt-1 text-sm text-yellow-600 font-medium">Only {item.product.stock} left in stock</p>
                  )}
                </div>
                
                <div className="flex flex-1 items-end justify-between text-sm mt-4">
                  <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      disabled={updating === item.id || item.quantity <= 1}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-l-lg transition-colors disabled:opacity-50"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 text-gray-900 font-medium border-x border-gray-200 min-w-[2.5rem] text-center">
                      {updating === item.id ? '...' : item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      disabled={updating === item.id || item.quantity >= item.product.stock}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-r-lg transition-colors disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={updating === item.id}
                    className="font-medium text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors disabled:opacity-50 flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="flex justify-between text-lg font-medium text-gray-900 mb-6">
          <p>Subtotal</p>
          <p className="text-2xl font-bold">${cartTotal.toFixed(2)}</p>
        </div>
        <p className="mt-0.5 text-sm text-gray-500 mb-6">
          Shipping and taxes calculated at checkout.
        </p>
        <div className="mt-6">
          <Button variant="primary" className="w-full text-lg py-4 shadow-md" onClick={() => navigate('/checkout')}>
            Proceed to Checkout
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
        <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
          <p>
            or{' '}
            <Link to="/products" className="font-medium text-brand hover:text-brand-dark transition-colors">
              Continue Shopping
              <span aria-hidden="true"> &rarr;</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
