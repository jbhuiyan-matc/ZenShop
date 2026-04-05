import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, MapPin, CheckCircle, Truck, XCircle, ArrowRight } from 'lucide-react';
import { ordersAPI } from '../services/api';
import { useApp } from '../store/useApp';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useApp();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await ordersAPI.getAll();
        setOrders(data);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Failed to load your order history.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 animate-in fade-in">
        <Package className="mx-auto h-16 w-16 text-gray-300 mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view orders</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          You need to be signed in to view your order history and tracking information.
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="primary" to="/login">Sign In</Button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'PAID':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'SHIPPED':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'DELIVERED':
        return <MapPin className="h-5 w-5 text-green-600" />;
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shadow-sm border";
    switch (status) {
      case 'PENDING_PAYMENT':
        return <span className={`${baseClasses} bg-yellow-50 text-yellow-800 border-yellow-200`}>Pending Payment</span>;
      case 'PAID':
        return <span className={`${baseClasses} bg-green-50 text-green-800 border-green-200`}>Paid & Processing</span>;
      case 'SHIPPED':
        return <span className={`${baseClasses} bg-blue-50 text-blue-800 border-blue-200`}>Shipped</span>;
      case 'DELIVERED':
        return <span className={`${baseClasses} bg-green-100 text-green-800 border-green-300`}>Delivered</span>;
      case 'CANCELLED':
        return <span className={`${baseClasses} bg-red-50 text-red-800 border-red-200`}>Cancelled</span>;
      default:
        return <span className={`${baseClasses} bg-gray-50 text-gray-800 border-gray-200`}>{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">Order History</h1>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3 mb-6">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
        <XCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Orders</h3>
        <p className="text-gray-500 mb-8">{error}</p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 animate-in fade-in">
        <div className="bg-gray-50 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders found</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          You haven't placed any orders yet. When you do, their status and tracking info will appear here.
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
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">Order History</h1>
      
      <div className="space-y-8">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="bg-gray-50 border-b border-gray-100 sm:flex sm:items-center sm:justify-between px-6 py-5">
              <div className="flex-1 min-w-0 mb-4 sm:mb-0">
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Order ID <span className="text-gray-900 font-mono">{order.id}</span>
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                  <p>
                    Placed on <time dateTime={order.createdAt}>{new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</time>
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-end">
                  <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                  <p className="text-lg font-bold text-gray-900">${Number(order.total).toFixed(2)}</p>
                </div>
              </div>
            </CardHeader>

            <CardBody className="p-0">
              <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(order.status)}
                  <span className="text-sm font-medium text-gray-900">Status:</span>
                  {getStatusBadge(order.status)}
                </div>
              </div>

              <ul className="divide-y divide-gray-100">
                {order.orderItems.map((item) => (
                  <li key={item.id} className="p-6 flex items-center bg-white hover:bg-gray-50/50 transition-colors">
                    <div className="flex-shrink-0 h-20 w-20 bg-gray-100 rounded-md border border-gray-200 overflow-hidden">
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
                    <div className="ml-6 flex-1 flex flex-col">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-semibold text-gray-900 hover:text-brand transition-colors line-clamp-1">
                          <Link to={`/products/${item.product.id}`}>{item.product.name}</Link>
                        </h4>
                        <p className="ml-4 text-base font-medium text-gray-900">
                          ${Number(item.price).toFixed(2)}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{item.product.description}</p>
                      <p className="mt-2 text-sm text-gray-500 font-medium">Qty: {item.quantity}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
