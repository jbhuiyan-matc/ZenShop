import { createContext, useContext, useState, useMemo } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthRestoring, setIsAuthRestoring] = useState(true);
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = user !== null;
  const isAdmin = user?.role === 'ADMIN';
  const cartTotal = cart.reduce((total, item) => total + (parseFloat(item.product.price) * item.quantity), 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const value = useMemo(() => ({
    user, setUser,
    isAuthRestoring, setIsAuthRestoring,
    isAuthenticated,
    isAdmin,
    cart, setCart,
    cartTotal,
    cartCount,
    toast, setToast,
    isLoading, setIsLoading,
  }), [user, isAuthRestoring, cart, cartTotal, cartCount, toast, isLoading, isAuthenticated, isAdmin]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
