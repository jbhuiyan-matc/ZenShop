import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { useApp } from '../store/useApp';
import { productsAPI, cartAPI } from '../services/api';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const { setCart, user, setToast } = useApp();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const data = await productsAPI.getById(id);
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Product not found or an error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const addToCart = async () => {
    if (!user) {
      setToast({ message: 'Please login to add items to cart', type: 'info' });
      navigate('/login', { state: { from: location } });
      return;
    }

    if (!product) return;

    setAdding(true);
    try {
      // Optimistic update could be done here, but for safety we wait for API
      await cartAPI.addToCart(product.id, quantity);
      
      // Refresh cart to ensure sync
      const cartData = await cartAPI.getCart();
      setCart(cartData);
      
      setToast({ message: 'Added to cart!', type: 'success' });
    } catch (err) {
      console.error('Error adding to cart:', err);
      setToast({ message: 'Failed to add item to cart', type: 'error' });
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Product Not Found'}</h2>
        <Link to="/products" className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/products" className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Products
      </Link>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image */}
          <div className="h-96 md:h-full bg-gray-100 flex items-center justify-center p-8">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/600x400?text=No+Image';
                  e.target.onerror = null;
                }}
              />
            ) : (
              <div className="text-gray-400 flex flex-col items-center">
                <ShoppingCart className="w-20 h-20 mb-4 opacity-20" />
                <span>No Image Available</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-8 md:p-12 flex flex-col">
            <div className="mb-auto">
              {product.category && (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 mb-4">
                  {product.category.name}
                </span>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <p className="text-4xl font-bold text-blue-600 mb-6">${product.price}</p>
              
              <div className="prose text-gray-600 mb-8">
                <p>{product.description}</p>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
                {product.stock > 0 ? (
                  <span className="flex items-center text-green-600">
                    <Check className="w-4 h-4 mr-1" />
                    In Stock ({product.stock} available)
                  </span>
                ) : (
                  <span className="text-red-500 font-medium">Out of Stock</span>
                )}
              </div>
            </div>

            <div className="border-t pt-8">
              <div className="flex items-center space-x-4">
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-medium text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={addToCart}
                  disabled={product.stock === 0 || adding}
                  className={`flex-1 flex items-center justify-center px-8 py-3 rounded-lg font-semibold text-white transition-all
                    ${product.stock > 0 
                      ? 'bg-neutral-900 hover:bg-neutral-800 shadow-md hover:shadow-lg transform active:scale-95' 
                      : 'bg-gray-300 cursor-not-allowed'}`}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {adding ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
