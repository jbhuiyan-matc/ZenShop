import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Search, Eye } from 'lucide-react';
import { useAtom } from 'jotai';
import { productsAPI, categoriesAPI, cartAPI } from '../services/api';
import { cartAtom, userAtom, toastAtom } from '../store/atoms';
import type { Product, Category } from '../types';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [, setCart] = useAtom(cartAtom);
  const [user] = useAtom(userAtom);
  const [, setToast] = useAtom(toastAtom);

  const selectedCategory = searchParams.get('category');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productsAPI.getAll({
            categoryId: selectedCategory || undefined,
            search: searchQuery || undefined
          }),
          categoriesAPI.getAll()
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, searchQuery]);

  const addToCart = async (productId: string) => {
    if (!user) {
      setToast({ message: 'Please login to add items to cart', type: 'info' });
      return;
    }
    try {
      const response = await cartAPI.addToCart(productId, 1);
      const updatedItem = response.data;
      
      setCart((prevCart) => {
        const itemExists = prevCart.find(item => item.id === updatedItem.id);
        if (itemExists) {
          return prevCart.map(item => 
            item.id === updatedItem.id ? updatedItem : item
          );
        }
        return [...prevCart, updatedItem];
      });
      
      setToast({ message: 'Added to cart!', type: 'success' });
    } catch (error) {
      console.error('Error adding to cart:', error);
      setToast({ message: 'Failed to add item', type: 'error' });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the useEffect dependency
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <h1 className="text-4xl font-extrabold text-neutral-900 mb-4">Welcome to ZenShop</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Secure, simple, and fast. Browse our collection below.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          <button
            onClick={() => setSearchParams({})}
            className={`px-4 py-2 rounded-lg transition-colors ${
              !selectedCategory 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSearchParams({ category: category.id })}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 md:w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button 
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Search size={20} />
          </button>
        </form>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://placehold.co/600x400?text=No+Image';
                    target.onerror = null;
                  }}
                />
              ) : (
                <span className="text-gray-400">No Image</span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 truncate">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                <div className="flex space-x-2">
                  <Link 
                    to={`/products/${product.id}`}
                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Eye size={20} />
                  </Link>
                  <button 
                    onClick={() => addToCart(product.id)}
                    className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <ShoppingCart size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found</p>
        </div>
      )}
    </div>
  );
}
