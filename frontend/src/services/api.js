const API_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.origin.startsWith('http://localhost')
    ? 'http://localhost:5001/api'
    : `${window.location.origin}/api`);

function getToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login?expired=true';
    }
    const error = await response.json().catch(() => ({}));
    throw { response: { status: 401, data: error } };
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw { response: { status: response.status, data: error } };
  }

  // Handle 204 No Content
  if (response.status === 204) return null;

  return response.json();
}

// Auth API
export const authAPI = {
  login: (credentials) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),

  register: (credentials) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(credentials) }),

  getProfile: () =>
    request('/auth/me'),
};

// Products API
export const productsAPI = {
  getAll: (params) => {
    const searchParams = new URLSearchParams();
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params?.search) searchParams.set('search', params.search);
    const qs = searchParams.toString();
    return request(`/products${qs ? `?${qs}` : ''}`);
  },

  getById: (id) =>
    request(`/products/${id}`),
};

// Categories API
export const categoriesAPI = {
  getAll: () =>
    request('/categories'),

  getById: (id) =>
    request(`/categories/${id}`),
};

// Cart API
export const cartAPI = {
  getCart: () =>
    request('/cart'),

  addToCart: (productId, quantity) =>
    request('/cart', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),

  updateQuantity: (id, quantity) =>
    request(`/cart/${id}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),

  removeFromCart: (id) =>
    request(`/cart/${id}`, { method: 'DELETE' }),

  clearCart: () =>
    request('/cart', { method: 'DELETE' }),
};

// Orders API
export const ordersAPI = {
  getOrders: () =>
    request('/orders'),

  getOrderById: (id) =>
    request(`/orders/${id}`),

  create: (data) =>
    request('/orders', { method: 'POST', body: JSON.stringify(data) }),

  createOrder: (items) =>
    request('/orders', { method: 'POST', body: JSON.stringify({ items }) }),

  cancelOrder: (id) =>
    request(`/orders/${id}/cancel`, { method: 'PATCH' }),
};

// Admin API
export const adminAPI = {
  getAllOrders: () =>
    request('/orders/all'),

  updateOrderStatus: (id, status) =>
    request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  getStats: () =>
    request('/admin/stats'),
};
