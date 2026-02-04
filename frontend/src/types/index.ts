export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  _count?: {
    products: number;
  };
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  stock: number;
  categoryId: string | null;
  category: Category | null;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  quantity: number;
  product: Product;
  userId: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: string;
  product: Product;
  orderId: string;
  productId: string;
}

export interface Order {
  id: string;
  total: string;
  status: 'PENDING_PAYMENT' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  userId: string;
  orderItems?: OrderItem[];
  items?: OrderItem[];
  user?: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
