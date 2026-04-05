import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Users, DollarSign, AlertCircle, ShoppingBag, Plus, Edit2, Trash2 } from 'lucide-react';
import { adminAPI, productsAPI } from '../services/api';
import { useApp } from '../store/useApp';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, setToast } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
      setToast({ message: 'Access denied. Admin privileges required.', type: 'error' });
      return;
    }

    const fetchData = async () => {
      try {
        const [statsData, productsData] = await Promise.all([
          adminAPI.getStats(),
          productsAPI.getAll()
        ]);
        setStats(statsData);
        setProducts(productsData);
      } catch (err) {
        console.error('Admin fetch error:', err);
        setError('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate, setToast]);

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await productsAPI.delete(id);
      setProducts(products.filter(p => p.id !== id));
      setToast({ message: 'Product deleted successfully', type: 'success' });
    } catch (err) {
      console.error('Delete error:', err);
      setToast({ message: 'Failed to delete product', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse h-32 bg-gray-100 border-none"></Card>
          ))}
        </div>
        <Card className="animate-pulse h-96 bg-gray-100 border-none"></Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h3>
        <p className="text-gray-500 mb-8">{error}</p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-500">Manage your store, view statistics, and handle orders.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-md overflow-hidden relative">
          <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4">
            <DollarSign size={100} />
          </div>
          <CardBody className="relative z-10 p-6 flex flex-col h-full justify-between">
            <div className="flex items-center text-blue-100 mb-4">
              <DollarSign className="h-6 w-6 mr-2" />
              <h3 className="text-sm font-medium uppercase tracking-wider">Total Revenue</h3>
            </div>
            <p className="text-3xl font-bold">${Number(stats?.totalRevenue || 0).toFixed(2)}</p>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-none shadow-md overflow-hidden relative">
          <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4">
            <ShoppingBag size={100} />
          </div>
          <CardBody className="relative z-10 p-6 flex flex-col h-full justify-between">
            <div className="flex items-center text-indigo-100 mb-4">
              <ShoppingBag className="h-6 w-6 mr-2" />
              <h3 className="text-sm font-medium uppercase tracking-wider">Total Orders</h3>
            </div>
            <p className="text-3xl font-bold">{stats?.totalOrders || 0}</p>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none shadow-md overflow-hidden relative">
          <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4">
            <Package size={100} />
          </div>
          <CardBody className="relative z-10 p-6 flex flex-col h-full justify-between">
            <div className="flex items-center text-purple-100 mb-4">
              <Package className="h-6 w-6 mr-2" />
              <h3 className="text-sm font-medium uppercase tracking-wider">Active Products</h3>
            </div>
            <p className="text-3xl font-bold">{stats?.activeProducts || 0}</p>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500 to-rose-600 text-white border-none shadow-md overflow-hidden relative">
          <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4">
            <Users size={100} />
          </div>
          <CardBody className="relative z-10 p-6 flex flex-col h-full justify-between">
            <div className="flex items-center text-rose-100 mb-4">
              <Users className="h-6 w-6 mr-2" />
              <h3 className="text-sm font-medium uppercase tracking-wider">Total Users</h3>
            </div>
            <p className="text-3xl font-bold">{stats?.userCount || 0}</p>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Products Management */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="bg-white border-b border-gray-100 flex items-center justify-between py-4 px-6">
              <div className="flex items-center">
                <div className="bg-brand-light/20 p-2 rounded-full mr-3">
                  <Package className="text-brand h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Product Management</h2>
              </div>
              <Button variant="primary" size="sm" className="flex items-center">
                <Plus className="h-4 w-4 mr-1" />
                Add Product
              </Button>
            </CardHeader>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md border border-gray-200 overflow-hidden">
                              {product.imageUrl ? (
                                <img className="h-10 w-10 object-cover" src={product.imageUrl} alt="" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-400 text-[10px]">No img</div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 line-clamp-1 max-w-[200px]">{product.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${Number(product.price).toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                            product.stock > 10 
                              ? 'bg-green-50 text-green-800 border-green-200' 
                              : product.stock > 0 
                                ? 'bg-yellow-50 text-yellow-800 border-yellow-200' 
                                : 'bg-red-50 text-red-800 border-red-200'
                          }`}>
                            {product.stock} units
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded-md transition-colors">
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-md transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="bg-gray-50 border-b border-gray-100 py-4 px-6">
              <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            </CardHeader>
            <CardBody className="p-0">
              <ul className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {stats?.recentOrders?.length > 0 ? (
                  stats.recentOrders.map((order) => (
                    <li key={order.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                      <div className="flex justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900 truncate pr-4">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm font-bold text-gray-900">${Number(order.total).toFixed(2)}</p>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <p className="truncate pr-4">{order.user?.name || order.user?.email || 'Unknown User'}</p>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          order.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </li>
                  ))
                ) : (
                  <li className="p-6 text-center text-gray-500">No recent orders found.</li>
                )}
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
