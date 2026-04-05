import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import { productsAPI, cartAPI } from '../services/api';
import { useApp } from '../store/useApp';
import Button from '../components/ui/Button';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  
  const { user, setCart, setToast } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productsAPI.getById(id);
        setProduct(data);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      setToast({ message: 'Please login to add items to cart', type: 'info' });
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }

    setAddingToCart(true);
    try {
      const updatedItem = await cartAPI.addToCart(product.id, quantity);
      
      setCart((prevCart) => {
        const itemExists = prevCart.find(item => item.id === updatedItem.id);
        if (itemExists) {
          return prevCart.map(item => item.id === updatedItem.id ? updatedItem : item);
        }
        return [...prevCart, updatedItem];
      });
      
      setToast({ message: `Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart`, type: 'success' });
    } catch (err) {
      console.error('Failed to add to cart:', err);
      setToast({ message: err.response?.data?.error || 'Failed to add item to cart', type: 'error' });
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse lg:grid lg:grid-cols-2 lg:gap-x-8">
          <div className="aspect-w-4 aspect-h-3 bg-gray-200 rounded-2xl w-full h-[500px]"></div>
          <div className="mt-10 px-4 sm:px-0 lg:mt-0">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-3 mb-10">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="h-12 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
        <XCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h3>
        <p className="text-gray-500 mb-8">The product you are looking for does not exist or has been removed.</p>
        <Button variant="primary" to="/products">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
      </div>
    );
  }

  const inStock = product.stock > 0;
  const lowStock = inStock && product.stock <= 5;

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol role="list" className="flex items-center space-x-2 text-sm text-gray-500">
          <li><Link to="/" className="hover:text-brand transition-colors">Home</Link></li>
          <li><span className="text-gray-300 mx-2">/</span></li>
          <li><Link to="/products" className="hover:text-brand transition-colors">Products</Link></li>
          <li><span className="text-gray-300 mx-2">/</span></li>
          <li className="text-gray-900 font-medium" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
        {/* Product Image */}
        <div className="flex flex-col-reverse">
          <div className="w-full aspect-w-1 aspect-h-1 bg-gray-100 rounded-2xl overflow-hidden shadow-sm border border-gray-200 lg:aspect-w-4 lg:aspect-h-3 h-[400px] lg:h-[600px] relative">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/800x600?text=No+Image';
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full text-gray-400">
                No image available
              </div>
            )}
            
            {/* Badges overlay on image */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {!inStock && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                  Out of Stock
                </span>
              )}
              {lowStock && (
                <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold shadow-md">
                  Only {product.stock} Left
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="mt-10 px-4 sm:px-0 lg:mt-0">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
            {product.name}
          </h1>

          <div className="mb-6 flex items-center justify-between">
            <p className="text-3xl font-bold text-gray-900">
              ${Number(product.price).toFixed(2)}
            </p>
            
            <div className="flex items-center text-sm font-medium">
              {inStock ? (
                <span className="flex items-center text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  In Stock
                </span>
              ) : (
                <span className="flex items-center text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                  <XCircle className="w-4 h-4 mr-1.5" />
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          <div className="prose prose-sm sm:prose text-gray-500 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
            <p className="leading-relaxed">
              {product.description || "No description available for this product."}
            </p>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-8">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div className="w-1/3">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <select
                  id="quantity"
                  name="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  disabled={!inStock}
                  className="block w-full rounded-md border-gray-300 py-2.5 pl-3 pr-10 text-base focus:border-brand focus:outline-none focus:ring-brand sm:text-sm bg-white shadow-sm disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
                >
                  {[...Array(Math.min(10, product.stock || 1))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
              
              <Button
                variant="primary"
                size="lg"
                className="w-2/3 shadow-sm py-3"
                onClick={handleAddToCart}
                disabled={!inStock || addingToCart}
              >
                {addingToCart ? (
                  <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Adding...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </span>
                )}
              </Button>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center">
                <ShieldCheck className="h-5 w-5 mr-2 text-brand" />
                Secure Checkout
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                30-Day Returns
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
