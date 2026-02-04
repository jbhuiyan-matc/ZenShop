import axios from 'axios';
import type { AuthResponse, Category, LoginCredentials, Order, Product, RegisterCredentials, User, CartItem } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && (window as any).ENV?.VITE_API_URL) || 
  'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (credentials: LoginCredentials) => 
    api.post<AuthResponse>('/auth/login', credentials),
  
  register: (credentials: RegisterCredentials) => 
    api.post<AuthResponse>('/auth/register', credentials),
  
  getProfile: () => 
    api.get<User>('/auth/me'),
};

// Products API
export const productsAPI = {
  getAll: (params?: { categoryId?: string; search?: string }) => 
    api.get<Product[]>('/products', { params }),
  
  getById: (id: string) => 
    api.get<Product>(`/products/${id}`),
};

// Categories API
export const categoriesAPI = {
  getAll: () => 
    api.get<Category[]>('/categories'),
  
  getById: (id: string) => 
    api.get<Category>(`/categories/${id}`),
};

// Cart API
export const cartAPI = {
  getCart: () => 
    api.get<CartItem[]>('/cart'),
  
  addToCart: (productId: string, quantity: number) => 
    api.post<CartItem>('/cart', { productId, quantity }),
  
  updateQuantity: (id: string, quantity: number) => 
    api.put<CartItem>(`/cart/${id}`, { quantity }),
  
  removeFromCart: (id: string) => 
    api.delete(`/cart/${id}`),
  
  clearCart: () => 
    api.delete('/cart'),
};

// Orders API
export const ordersAPI = {
  getOrders: () => 
    api.get<Order[]>('/orders'),
  
  getOrderById: (id: string) => 
    api.get<Order>(`/orders/${id}`),
  
  create: (data: { shippingAddress: string; items: { productId: string; quantity: number }[] }) => 
    api.post<Order>('/orders', data),
  
  createOrder: (items: { productId: string; quantity: number }[]) => 
    api.post<Order>('/orders', { items }),
  
  cancelOrder: (id: string) => 
    api.patch<Order>(`/orders/${id}/cancel`),
};

// Admin API
export const adminAPI = {
  getAllOrders: () => 
    api.get<Order[]>('/orders/all'),
  
  updateOrderStatus: (id: string, status: string) => 
    api.patch<Order>(`/orders/${id}/status`, { status }),
  
  getStats: () => 
    api.get<{ 
      totalOrders: number; 
      totalRevenue: number; 
      activeProducts: number;
      lowStockProducts: number;
      recentOrders: Order[];
    }>('/admin/stats'),
};

export default api;
