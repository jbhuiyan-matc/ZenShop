import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Loader, ArrowRight } from 'lucide-react';
import { useApp } from '../store/useApp';
import { ordersAPI, cartAPI } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card, { CardHeader, CardBody } from '../components/ui/Card';

export default function Checkout() {
  const { cart, setCart, user, setToast } = useApp();
  const navigate = useNavigate();
  
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setToast({ message: 'Please sign in to checkout', type: 'info' });
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else if (cart.length === 0) {
      navigate('/cart');
    }
  }, [user, cart, navigate, setToast]);

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
  const total = subtotal; // Add shipping/tax logic here later if needed

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const shippingAddress = `${address}, ${city}, ${zip}`;
      const items = cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));

      await ordersAPI.create({ shippingAddress, items });
      
      // Clear cart on server
      try {
          await cartAPI.clearCart(); 
      } catch (e) { 
          console.warn("Failed to clear cart on server", e);
      }
      
      // Clear local cart state
      setCart([]);
      setToast({ message: 'Order placed successfully!', type: 'success' });
      navigate('/orders');
    } catch (error) {
      console.error('Order failed:', error);
      setToast({ 
        message: error.response?.data?.error || 'Failed to place order. Please try again.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || cart.length === 0) return null;

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">Checkout</h1>
      
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        {/* Checkout Form */}
        <div className="lg:col-span-7 space-y-8">
          <Card>
            <CardHeader className="bg-white border-b border-gray-100 flex items-center py-4 px-6">
              <div className="bg-brand-light/20 p-2 rounded-full mr-3">
                <MapPin className="text-brand h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Shipping Information</h2>
            </CardHeader>
            <CardBody>
              <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-6">
                <Input
                  label="Street Address"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, Apt 4B"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    label="City"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New York"
                  />
                  <Input
                    label="ZIP / Postal Code"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="10001"
                  />
                </div>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="bg-white border-b border-gray-100 flex items-center py-4 px-6">
              <div className="bg-brand-light/20 p-2 rounded-full mr-3">
                <CreditCard className="text-brand h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-100 text-blue-800 px-4 py-3 rounded-lg text-sm mb-6">
                  This is a simulation. Do not enter real credit card information. Any data entered will be accepted.
                </div>
                
                <Input
                  label="Name on Card"
                  required
                  form="checkout-form"
                  placeholder="John Doe"
                />

                <Input
                  label="Card Number"
                  required
                  form="checkout-form"
                  maxLength={19}
                  placeholder="0000 0000 0000 0000"
                />

                <div className="grid grid-cols-2 gap-6">
                  <Input
                    label="Expiration Date"
                    required
                    form="checkout-form"
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                  <Input
                    label="CVV"
                    required
                    form="checkout-form"
                    maxLength={4}
                    placeholder="123"
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-5 mt-10 lg:mt-0">
          <Card className="sticky top-24">
            <CardHeader className="bg-gray-50 border-b border-gray-100 py-4 px-6">
              <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
            </CardHeader>
            <CardBody className="p-0">
              <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto px-6">
                {cart.map(item => (
                  <li key={item.id} className="py-4 flex">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="h-full w-full object-cover object-center"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                          No img
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-sm font-medium text-gray-900">
                          <h3 className="line-clamp-2 pr-4">{item.product.name}</h3>
                          <p className="ml-4">${(Number(item.product.price) * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm mt-1">
                        <p className="text-gray-500">Qty {item.quantity}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              
              <div className="border-t border-gray-100 px-6 py-6 bg-gray-50/50">
                <div className="flex items-center justify-between text-base font-medium text-gray-900 mb-6">
                  <p>Order Total</p>
                  <p className="text-2xl font-bold text-brand">${total.toFixed(2)}</p>
                </div>
                <Button
                  type="submit"
                  form="checkout-form"
                  disabled={loading}
                  className="w-full text-lg py-4 shadow-md flex justify-center items-center"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Place Order
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
                <div className="mt-4 flex justify-center text-center text-xs text-gray-500">
                  <p>
                    By placing your order, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
