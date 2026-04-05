import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Search, Eye } from 'lucide-react';
import { useApp } from '../store/useApp';
import { productsAPI, categoriesAPI, cartAPI } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card, { CardBody, CardFooter } from '../components/ui/Card';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const { setCart, user, setToast } = useApp();

  const selectedCategory = searchParams.get('category');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          productsAPI.getAll({
            categoryId: selectedCategory || undefined,
            search: searchQuery || undefined
          }),
          categoriesAPI.getAll()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setToast({ message: 'Failed to load products', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, searchQuery, setToast]);

  const handleAddToCart = async (productId) => {
    if (!user) {
      setToast({ message: 'Please login to add items to cart', type: 'info' });
      return;
    }
    try {
      const updatedItem = await cartAPI.addToCart(productId, 1);
      
      setCart((prevCart) => {
        const itemExists = prevCart.find(item => item.id === updatedItem.id);
        if (itemExists) {
          return prevCart.map(item => item.id === updatedItem.id ? updatedItem : item);
        }
        return [...prevCart, updatedItem];
      });
      
      setToast({ message: 'Added to cart!', type: 'success' });
    } catch (error) {
      console.error('Error adding to cart:', error);
      setToast({ message: 'Failed to add item', type: 'error' });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by the useEffect dependency on searchQuery
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-brand-light/10 rounded-2xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-900 mb-6 tracking-tight">
          Welcome to ZenShop V2
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          A secure, modern, and fast e-commerce experience. Browse our curated collection below.
        </p>
      </section>

      {/* Filters and Search */}
      <section className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          <button
            onClick={() => setSearchParams({})}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !selectedCategory 
                ? 'bg-brand text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSearchParams({ category: category.id })}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-brand text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand focus:border-brand sm:text-sm transition-shadow"
            />
          </div>
        </form>
      </section>

      {/* Products Grid */}
      <section>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 w-full"></div>
                <CardBody className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </CardBody>
                <CardFooter className="flex justify-between items-center">
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="group hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
                <div className="relative aspect-w-4 aspect-h-3 bg-gray-100 overflow-hidden">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="object-cover w-full h-48 group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/600x400?text=No+Image';
                        e.target.onerror = null;
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center text-gray-400 bg-gray-100">
                      No Image
                    </div>
                  )}
                  {product.stock <= 5 && product.stock > 0 && (
                    <span className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">
                      Only {product.stock} left!
                    </span>
                  )}
                  {product.stock === 0 && (
                    <span className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>
                
                <CardBody className="flex-grow flex flex-col">
                  <Link to={`/products/${product.id}`} className="hover:text-brand transition-colors">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 mb-1">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
                    {product.description}
                  </p>
                  <div className="text-xl font-bold text-gray-900 mt-auto">
                    ${Number(product.price).toFixed(2)}
                  </div>
                </CardBody>

                <CardFooter className="flex justify-between items-center gap-2">
                  <Button 
                    variant="secondary" 
                    to={`/products/${product.id}`}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button 
                    variant="primary"
                    onClick={() => handleAddToCart(product.id)}
                    disabled={product.stock === 0}
                    className="flex-1"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4">
            <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
            <p className="text-gray-500">
              We couldn't find anything matching your search. Try adjusting your filters.
            </p>
            <Button 
              variant="secondary" 
              className="mt-6"
              onClick={() => {
                setSearchQuery('');
                setSearchParams({});
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
