import { atom } from 'jotai';
import type { CartItem, User } from '../types';

// Auth state
export const userAtom = atom<User | null>(null);
export const isAuthRestoringAtom = atom<boolean>(true);
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null);
export const isAdminAtom = atom((get) => get(userAtom)?.role === 'ADMIN');

// Cart state
export const cartAtom = atom<CartItem[]>([]);
export const cartTotalAtom = atom((get) => {
  const cart = get(cartAtom);
  return cart.reduce((total, item) => {
    return total + (parseFloat(item.product.price) * item.quantity);
  }, 0);
});
export const cartCountAtom = atom((get) => {
  const cart = get(cartAtom);
  return cart.reduce((count, item) => count + item.quantity, 0);
});

// UI state
export const isLoadingAtom = atom<boolean>(false);
export const toastAtom = atom<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
