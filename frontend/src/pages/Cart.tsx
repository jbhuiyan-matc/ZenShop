import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useAtom } from 'jotai';
import { cartAPI } from '../services/api';
import { cartAtom, userAtom } from '../store/atoms';
import type { CartItem } from '../types';

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useAtom(cartAtom);
  const [user] = useAtom(userAtom);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const response = await cartAPI.getCart();
        setCart(response.data);
      } catch (error) {
        console.error('Error fetching cart:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user, setCart]);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setUpdating(itemId);
    try {
      await cartAPI.updateQuantity(itemId, newQuantity);
      setCart((prevCart) => prevCart.map((item: CartItem) => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
      const err = error as { response?: { data?: { error?: string } } };
      alert(err.response?.data?.error || 'Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: string) => {
    setUpdating(itemId);
    try {
      await cartAPI.removeFromCart(itemId);
      setCart((prevCart) => prevCart.filter((item: CartItem) => item.id !== itemId));
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setUpdating(null);
    }
  };

  const clearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return;
    try {
      await cartAPI.clearCart();
      setCart([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const subtotal = cart.reduce((sum: number, item: CartItem) => 
    sum + (Number(item.product?.price) || 0) * item.quantity, 0
  );

  if (!user) {
    return (
      <div className="text-center py-12">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-6">Please login to view your cart</p>
        <Link
          to="/login"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Login to Continue
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-6">Looks like you haven&apos;t added anything yet</p>
        <Link
          to="/products"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Clear Cart
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        {cart.map((item: CartItem) => (
          <div
            key={item.id}
            className="flex items-center p-4 border-b last:border-b-0 hover:bg-gray-50"
          >
            {/* Product Image */}
            <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
              {item.product?.imageUrl ? (
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 ml-4">
              <Link
                to={`/products/${item.product?.id}`}
                className="font-semibold text-gray-900 hover:text-blue-600"
              >
                {item.product?.name}
              </Link>
              <p className="text-blue-600 font-bold mt-1">
                ${Number(item.product?.price || 0).toFixed(2)}
              </p>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                disabled={updating === item.id || item.quantity <= 1}
                className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-medium">
                {updating === item.id ? '...' : item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                disabled={updating === item.id}
                className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Item Total */}
            <div className="w-24 text-right font-bold text-gray-900 ml-4">
              ${((Number(item.product?.price) || 0) * item.quantity).toFixed(2)}
            </div>

            {/* Remove Button */}
            <button
              onClick={() => removeItem(item.id)}
              disabled={updating === item.id}
              className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded disabled:opacity-50"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center text-lg mb-4">
          <span className="text-gray-600">Subtotal ({cart.length} items)</span>
          <span className="font-bold text-gray-900">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-lg mb-4">
          <span className="text-gray-600">Shipping</span>
          <span className="text-green-600 font-medium">FREE</span>
        </div>
        <hr className="my-4" />
        <div className="flex justify-between items-center text-xl mb-6">
          <span className="font-bold">Total</span>
          <span className="font-bold text-blue-600">${subtotal.toFixed(2)}</span>
        </div>
        <button
          onClick={() => navigate('/checkout')}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Proceed to Checkout
        </button>
        <Link
          to="/products"
          className="block text-center mt-4 text-blue-600 hover:text-blue-800"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
