import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, ShoppingCart, Eye, AlertCircle } from 'lucide-react';
import { productsAPI, categoriesAPI, cartAPI } from '../services/api';
import { useApp } from '../store/useApp';
import Button from '../components/ui/Button';
import Card, { CardBody, CardFooter } from '../components/ui/Card';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [showFilters, setShowFilters] = useState(false);
  
  const { user, setCart, setToast } = useApp();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesAPI.getAll();
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const categoryId = searchParams.get('category');
        const search = searchParams.get('search');
        
        const data = await productsAPI.getAll({ 
          categoryId: categoryId || undefined, 
          search: search || undefined 
        });
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    
    if (searchQuery) params.set('search', searchQuery);
    else params.delete('search');
    
    if (selectedCategory) params.set('category', selectedCategory);
    else params.delete('category');
    
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSearchParams({});
    setShowFilters(false);
  };

  const handleAddToCart = async (productId) => {
    if (!user) {
      setToast({ message: 'Please login to add items to cart', type: 'info' });
      return;
    }
    
    try {
      const updatedItem = await cartAPI.addToCart(productId, 1);
      
      setCart(prevCart => {
        const itemExists = prevCart.find(item => item.id === updatedItem.id);
        if (itemExists) {
          return prevCart.map(item => item.id === updatedItem.id ? updatedItem : item);
        }
        return [...prevCart, updatedItem];
      });
      
      setToast({ message: 'Added to cart successfully', type: 'success' });
    } catch (err) {
      console.error('Failed to add to cart:', err);
      setToast({ message: 'Failed to add item to cart', type: 'error' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Our Products</h1>
          <p className="mt-2 text-sm text-gray-500">Browse our collection of high-quality items.</p>
        </div>
        
        <Button 
          variant="secondary" 
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center justify-center gap-2"
        >
          <Filter className="w-4 h-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-brand" />
              Filters
            </h2>
            
            <form onSubmit={handleSearch} className="space-y-6">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand focus:border-brand sm:text-sm transition-colors"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm rounded-md transition-colors"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                <Button type="submit" variant="primary" className="w-full">
                  Apply Filters
                </Button>
                {(searchQuery || selectedCategory) && (
                  <Button type="button" variant="ghost" onClick={clearFilters} className="w-full">
                    Clear All
                  </Button>
                )}
              </div>
            </form>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 w-full rounded-t-xl"></div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="group hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
                  <div className="relative aspect-w-4 aspect-h-3 bg-gray-100 overflow-hidden rounded-t-xl">
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
                      <span className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                        Only {product.stock} left!
                      </span>
                    )}
                    {product.stock === 0 && (
                      <span className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  
                  <CardBody className="flex-grow flex flex-col p-5">
                    <Link to={`/products/${product.id}`} className="hover:text-brand transition-colors block">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 mb-1" title={product.name}>
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

                  <CardFooter className="flex justify-between items-center gap-2 p-5 pt-0 bg-transparent border-t-0">
                    <Button 
                      variant="secondary" 
                      to={`/products/${product.id}`}
                      className="flex-1 text-sm py-2"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button 
                      variant="primary"
                      onClick={() => handleAddToCart(product.id)}
                      disabled={product.stock === 0}
                      className="flex-1 text-sm py-2"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
              <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                We couldn&apos;t find anything matching your current filters. Try adjusting your search criteria.
              </p>
              <Button variant="secondary" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
